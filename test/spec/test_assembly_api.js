/*global define,expect,it*/
/*jslint white:true*/
define([
    'kb/common/session',
    'kb/data/assembly',
    'yaml!config/config.yml',
    'json!data/sample-data_assembly_KBaseGenomes.ContigSet-1.1.json',
    'json!data/sample-data_assembly_KBaseGenomes.ContigSet-2.0.json',
    'json!data/sample-data_assembly_KBaseGenomes.ContigSet-3.0.json',
    'json!data/sample-data_assembly_KBaseGenomeAnnotations.Assembly-1.0.json'
 ],
    function (Session, API, config, testDataContigSet1, testDataContigSet2, testDataContigSet3, testDataAssembly1) {
        'use strict';
        // Taxon API tests
        describe('Assembly API', function () {
            var token,
                serviceUrl = config.assemblyUrl,
                username = config.username,
                password = config.password,
                loginUrl = config.loginUrl,  
                timeout = config.timeout,
                testTimeout = config.testTimeout,
                session = Session.make({
                    cookieName: 'testing',
                    loginUrl: loginUrl
                });

            function makeClient(options) {
                var args = {
                    ref: options.ref,
                    url: serviceUrl,
                    timeout: (options && options.timeout) || timeout,
                    token: token
                };
                return API.client(args);
            }

            beforeAll(function (done) {
                return session.login({username: username, password: password})
                    .then(function (kbSession) {
                        // console.log('got token'); console.log(kbSession.token);
                        token = kbSession.token;
                        done();
                        return null;
                    })
                    .catch(function (err) {
                        done.fail(err);
                    });
            });
            // Note: These are in the same order as methods in Assembly.js

            var originalTimeout;
            beforeEach(function (done) {
                originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
                jasmine.DEFAULT_TIMEOUT_INTERVAL = testTimeout;
                done();
            });

            afterEach(function (done) {
                jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
                done();
            });

            // This works if all tests use default settings.

            var testDataSets = [testDataContigSet1, testDataContigSet2, testDataContigSet3, testDataAssembly1];

            testDataSets.forEach(function (testData) {
                var methods = Object.keys(testData.results);

                methods.forEach(function (methodName) {
                    it('Calls method "' + methodName + '" arguments provided by test data and expect results provided by test data.', function (done) {
                        var client = makeClient({
                            ref: testData.input.ref
                        }),
                            method = client[methodName],
                            results = testData.results[methodName];

                        return method.apply(client, results.args)
                            .then(function (value) {
                                switch (results.type) {
                                    case 'set':
                                        if (value !== undefined) {
                                            value.sort();
                                            results.result.sort();
                                        }
                                        break;
                                }
                                expect(value).toEqual(results.result);
                                done();
                                return null;
                            })
                            .catch(function (err) {
                                var expected = results.exception;
                                if (expected) {
                                    if (err instanceof API[expected]) {
                                        done();
                                        return null;
                                    } else {
                                        done.fail('Exception thrown, but not of the expected type. Expected ' + expected + ', got ' + err.name + ':' + err.message);
                                        return null;
                                    }
                                } else {
                                    done.fail('Exception thrown, but not expected: ' + err.name + ':' + err.message);
                                    return null;
                                }
                            });
                    });

                });
            });


        });
    });