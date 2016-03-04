/*global define,expect,it*/
/*jslint white:true*/
define([
    'bluebird',
    'kb/common/session',
    'kb/data/assembly',
    'json!data/sample_data_assembly_1.json'
],
    function (Promise, Session, Assembly, testData) {
        'use strict';


        // Taxon API tests
        describe('Taxon API', function () {
            var token,
                serviceUrl = 'https://ci.kbase.us/services/data/assembly',
                testRef = testData.input.ref,
                // DELETE ME
                username = 'eapearson',
                password = 'Oc3an1cWhal3',
                loginUrl = 'https://ci.kbase.us/services/authorization/Sessions/Login',
                timeout = 6000,
                    session = Session.make({
                        cookieName: 'testing',
                        loginUrl: loginUrl
                    });
                
                
            function makeAssemblyClient() {
                return Promise.try(function () {
                    var args = {
                        ref: testRef,
                        url: serviceUrl,
                        timeout: timeout,
                        token: token
                    };
                    try {
                        return Assembly.client(args);
                    } catch (ex) {
                        console.error('ERROR making taxon client');
                        console.error(ex);
                        throw ex;
                    }
                });
            }
            
            beforeAll(function(done) {
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

            it('Calls assembly_id method against a known object receives the expected result', function (done) {
                makeAssemblyClient()
                    .then(function(client) {
                        return client.assembly_id();
                    })
                    .then(function (value) {
                        expect(value).toBe(testData.results.assembly_id);
                        done();
                        return null;
                    })
                    .catch(done.fail);
            }, 10000);

            it('Calls genome_annotations method against a known object receives the expected result', function (done) {
                makeAssemblyClient()
                    .then(function(client) {
                        return client.genome_annotations();
                    })
                    .then(function (value) {
                        expect(value).toEqual(testData.results.genome_annotations);
                        done();
                        return null;
                    })
                    .catch(done.fail);
            }, 10000);

            it('Calls external_source_info method against a known object receives the expected result', function (done) {
                makeAssemblyClient()
                    .then(function(client) {
                        return client.external_source_info();
                    })
                    .then(function (value) {
                        expect(value).toEqual(testData.results.external_source_info);
                        done();
                        return null;
                    })
                    .catch(done.fail);
            }, 10000);

            it('Calls stats method against a known object receives the expected result', function (done) {
                makeAssemblyClient()
                    .then(function(client) {
                        return client.stats();
                    })
                    .then(function (value) {
                        expect(value).toEqual(testData.results.stats);
                        done();
                        return null;
                    })
                    .catch(done.fail);
            }, 10000);

            it('Calls number_contigs method against a known object receives the expected result', function (done) {
                makeAssemblyClient()
                    .then(function(client) {
                        return client.number_contigs();
                    })
                    .then(function (value) {
                        expect(value).toBe(testData.results.number_contigs);
                        done();
                        return null;
                    })
                    .catch(done.fail);
            }, 10000);

            it('Calls gc_content method against a known object receives the expected result', function (done) {
                makeAssemblyClient()
                    .then(function(client) {
                        return client.gc_content();
                    })
                    .then(function (value) {
                        expect(value).toBe(testData.results.gc_content);
                        done();
                        return null;
                    })
                    .catch(done.fail);
            }, 10000);

            it('Calls dna_size method against a known object receives the expected result', function (done) {
                makeAssemblyClient()
                    .then(function(client) {
                        return client.dna_size();
                    })
                    .then(function (value) {
                        expect(value).toBe(testData.results.dna_size);
                        done();
                        return null;
                    })
                    .catch(done.fail);
            }, 10000);

            it('Calls contig_ids method against a known object receives the expected result', function (done) {
                makeAssemblyClient()
                    .then(function(client) {
                        return client.contig_ids();
                    })
                    .then(function (value) {
                        // note that we sort the array in order to simulate a set.
                        expect(value.sort()).toEqual(testData.results.contig_ids.sort());
                        done();
                        return null;
                    })
                    .catch(done.fail);
            }, 10000);

            it('Calls contig_lengths method against a known object receives the expected result', function (done) {
                makeAssemblyClient()
                    .then(function(client) {
                        return client.contig_lengths.apply(client, testData.args.contig_lengths);
                    })
                    .then(function (value) {
                        // note that we sort the array in order to simulate a set.
                        expect(value).toEqual(testData.results.contig_lengths);
                        done();
                        return null;
                    })
                    .catch(done.fail);
            }, 10000);

            it('Calls contig_gc_content method against a known object receives the expected result', function (done) {
                makeAssemblyClient()
                    .then(function(client) {
                        return client.contig_gc_content.apply(client, testData.args.contig_gc_content);
                    })
                    .then(function (value) {
                        // note that we sort the array in order to simulate a set.
                        expect(value).toEqual(testData.results.contig_gc_content);
                        done();
                        return null;
                    })
                    .catch(done.fail);
            }, 10000);

            it('Calls contigs method against a known object receives the expected result', function (done) {
                makeAssemblyClient()
                    .then(function(client) {
                        return client.contigs.apply(client, testData.args.contigs);
                    })
                    .then(function (value) {
                        // note that we sort the array in order to simulate a set.
                        expect(value).toEqual(testData.results.contigs);
                        done();
                        return null;
                    })
                    .catch(done.fail);
            }, 10000);

            
            

            // Constructor variants

//            it('constructor without config', function (done) {
//                function makeTaxon() {
//                    return Taxon.client();
//                }
//                // TODO: to throw WHAT?
//                expect(makeTaxon).toThrow();
//                done();
//                return null;
//            }, 1000);
//
//            it('constructor with empty config', function (done) {
//                function makeTaxon() {
//                    return Taxon.client();
//                }
//                expect(makeTaxon).toThrow();
//                done();
//                return null;
//            }, 1000)
//                ;
//            it('constructor config missing ref', function (done) {
//                function makeTaxon() {
//                    return Taxon.client({url: url, token: null, timeout: 6000});
//                }
//                expect(makeTaxon).toThrow();
//                done();
//                return null;
//            }, 1000);
//
//            it('constructor config missing url', function (done) {
//                function makeTaxon() {
//                    return Taxon.client({ref: taxon_ref, token: null, timeout: 6000});
//                }
//                expect(makeTaxon).toThrow();
//                done();
//                return null;
//            }, 1000);
//
//            it('constructor config null token', function (done) {
//                 function makeTaxon() {
//                    return Taxon.client({ref: taxon_ref, url: url, token: null, timeout: 6000});
//                }
//                expect(makeTaxon).not.toThrow();
//                done();
//                return null;
//            }, 1000);
//
//            it('constructor config bad token', function (done) {
//                function makeTaxon() {
//                    return Taxon.client({ref: taxon_ref, url: url, token: "hello, world", timeout: 6000});
//                }
//                expect(makeTaxon).toThrow();
//                done();
//                return null;
//            }, 1000);
//
//            it('constructor config no timeout', function (done) {
//                function makeTaxon() {
//                    return Taxon.client({ref: taxon_ref, url: url, token: null});
//                }
//                expect(makeTaxon).not.toThrow();
//                done();
//                return null;
//            }, 1000);
//
//            it('client bad url', function (done) {
//                var runner = function () {
//                    var c = Taxon.client({
//                        ref: taxon_ref, 
//                        url: 'http://localhost:99',
//                        token: null
//                    });
//                    console.info("Bad URL Client: ", c);
//                };
//                expect(runner).toThrow();
//                done();
//                return null;
//            }, 1000);
        });
    });