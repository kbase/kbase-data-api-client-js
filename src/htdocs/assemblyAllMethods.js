require([
    'bluebird',
    'kb/data/assembly',
    'kb/thrift/core',
    'kb/common/session',
    'kb/common/html',
    'htdocs/utils',
    'yaml!config/config.yml'
], function (Promise, Assembly, Thrift, fSession, html, utils, config) {
    'use strict';
    function toArray(x) {
        return Array.prototype.slice.call(x);
    }
    
    function showField(field, value, time) {
        var displayValue = utils.formatValue(value);
        var node = document.querySelector('#result [data-field="' + field + '"]');
        if (node) {
            toArray(node.querySelectorAll('[data-element="label"]')).forEach(function (el) {
                el.innerHTML = field;
            });
            toArray(node.querySelectorAll('[data-element="value"]')).forEach(function (el) {
                el.innerHTML = displayValue;
            });
            toArray(node.querySelectorAll('[data-element="type"]')).forEach(function (el) {
                el.innerHTML = (typeof value);
            });
            toArray(node.querySelectorAll('[data-element="time"]')).forEach(function (el) {
                el.innerHTML = String(time);
            });
        }
    }
    
    function showStatus(msg) {
        document.querySelector('#status').innerHTML = msg;
    }
    function showError(err) {
        if (err.type) {
            document.querySelector('#error > [data-field="type"]').innerHTML = err.type;
        }
        if (err.title) {
            document.querySelector('#error > [data-field="title"]').innerHTML = err.title;
        }
        if (err.message) {
            document.querySelector('#error > [data-field="message"]').innerHTML = err.message;
        }
        if (err.suggestion) {
            document.querySelector('#error > [data-field="suggestion"]').innerHTML = err.suggestion;
        }
        if (err.errorObject) {
            console.log('ERROR OBJECT');
            console.log(err.errorObject);
        }
    }
    var methods = [
        'getAssemblyId', 'getGenomeAnnotation', 'getExternalSourceInfo', 'getStats', 
        'getNumberContigs', 'getGCContent', 'getDNASize', 'getContigIds', 
    ];
    var methods2 = [
        'getContigLengths',
        'getContigGCContent',
        'getContigs'
    ];
    
    var objectRef = utils.getParams().objectRef,
        results = {};
    document.getElementById('objectRef').innerHTML = objectRef;
    
    var content = '<table border="1">' + methods.concat(methods2).map(function (method) {
        if (method.pop) {
            method = method[0];
        }
        return '<tr data-field="' + method + '">' +
            '<td data-element="label"></td>' +
            '<td data-element="value"></td>' +
            '<td data-element="type"></td>' +
            '<td data-element="time"></td>' +
            '</tr>';
    }).join('\n') + '</table>';
    document.querySelector('#result').innerHTML = content;
    try {
        showStatus('Starting...');
        var session = fSession.make({
            cookieName: config.cookieName,
            loginUrl: config.loginUrl
        });
        showStatus('Logging in...');
        session.login({
            username: config.username,
            password: config.password
        })
            .then(function (kbSession) {
                console.log('timeout is ' + config.timeout);
                return Assembly.make({
                    ref: objectRef,
                    url: config.assemblyUrl,
                    token: kbSession.token,
                    timeout: config.timeout
                });
            })
            .then(function (assembly) {
                showStatus('Building methods to test...');
                var start = new Date().getTime();
                var promises = methods.map(function (method) {
                    var methodName, methodArgs;
                    if (method.pop) {
                        methodName = method[0];
                        methodArgs = method.slice(1);
                    } else {
                        methodName = method;
                        methodArgs = [];
                    }
                    return new Promise(function (resolve, reject) {
                        showField(methodName, 'Loading...');
                        assembly[methodName].apply(assembly, methodArgs)
                            .then(function (value) {
                                var elapsed = (new Date()).getTime() - start;
                                results[methodName] = value;
                                showField(methodName, value, elapsed);
                                resolve();
                            })
                            .catch(function (err) {
                                if (err instanceof Assembly.AttributeException) {
                                    showField(methodName, '* n/a to this object *');
                                } else {
                                    showField(methodName, 'ERROR: ' + err.name + ':' + err.message);
                                }
                                reject(err);
                            });
                    }).reflect();
                });
                showStatus('Running methods...');
                return [assembly, Promise.all(promises)];
            })
            .spread(function (assembly) {
                showStatus('Building methods to test...');
                var start = new Date().getTime();
                var promises = methods2.map(function (method) {
                    return new Promise(function (resolve, reject) {
                        showField(method, 'Loading...');
                        assembly[method].apply(assembly, [results.getContigIds.slice(0,5)])
                            .then(function (value) {
                                var elapsed = (new Date()).getTime() - start;
                                showField(method, value, elapsed);
                                resolve();
                            })
                            .catch(function (err) {
                                if (err instanceof Assembly.AttributeException) {
                                    showField(method, '* n/a to this object *');
                                } else {
                                    showField(method, 'ERROR: ' + err.name + ':' + err.message);
                                }
                                reject(err);
                            });
                    }).reflect();
                });
                showStatus('Running methods...');
                return Promise.all(promises);
            })
            .then(function () {
                showStatus('done');
            })
            .catch(function (err) {
                showStatus('done, with error');
                if (err instanceof Assembly.ClientException) {
                    utils.showError(err);
                } else if (err instanceof Thrift.TTransportError) {
                    utils.showError(err);
                } else if (err instanceof Thrift.TException) {
                    utils.showError({
                        name: 'ThriftException',
                        reason: err.name,
                        message: err.getMessage()
                    });
                } else if (err instanceof Assembly.AttributeException) {
                    utils.showError({
                        name: 'AttributeException', 
                        reason: err.name,
                        message: 'This attribute is not supported for this object'
                    });
                } else {
                    console.log(err);
                    utils.showError({
                        type: 'UnknownError',
                        message: 'Check the browser console'
                    });
                }
            });
    } catch (ex) {
        showError(ex);
    }
});
