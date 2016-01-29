require([
    'bluebird',
    'kb/data/genomeAnnotation',
    'kb/service/client/Workspace',
    'kb/thrift/core',
    'kb/common/session',
    'kb/common/html',
    'htdocs/utils',
    'yaml!config/config.yml'
], function (Promise, GenomeAnnotation, Workspace, Thrift, fSession, html, utils, config) {
    'use strict';
    function toArray(x) {
        return Array.prototype.slice.call(x);
    }

    function showField(field, value, time, options) {
        var displayValue = utils.formatValue(value, options);
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
    var results = {};
    var methods = [
        {
            name: 'getTaxon',
            type: 'string',
            use: true
        },
        {
            name: 'getAssembly',
            type: 'string',
            use: true
        },
        {
            name: 'getFeatureTypes',
            type: 'array of string ',
            use: true
        },
        {
            name: 'getFeatureTypeDescriptions',
            type: 'object (string -> number)',
            limit: 100,
            use: true
        },
        {
            name: 'getFeatureTypeCounts',
            type: 'object (string -> number)',
            limit: 100,
            arguments: [
                ['crs', 'gene', 'loci', 'trm', 'pbs', 'opr', 'sRNA', 'rna', 'crispr', 'pseudo', 'pp', 'bs', 'locus', 'prm', 'att', 'rsw', 'mRNA', 'CDS', 'pi', 'PEG', 'trnspn']
            ],
            use: true
        },
        {
            name: 'getFeatureIds',
            type: 'object (FeatureIdMapping)',
            arguments: [
                {
//                    type_list: [],
//                    region_list: [],
//                    function_list: [],
//                    alias_list: []
                },
                // type, region, function, alias
                'type'
            ],
            use: true
        },
        {
            name: 'getFeatures',
            type: 'object (string - > FeatureData)',
            arguments: [
                function () {
                    if (results.getFeatureIds.by_type.CDS) {
                        return results.getFeatureIds.by_type.CDS.slice(0, 5);
                    }
                    return [];
                }
            ],
            use: true

        },
        {
            name: 'getProteins',
            type: 'array (of ProteinData)',
            use: true
        },
        {
            name: 'getFeatureLocations',
            type: 'object (string -> (list of Region)',
            arguments: [
                function () {
                    if (results.getFeatureIds.by_type.CDS) {
                        return results.getFeatureIds.by_type.CDS.slice(0, 5);
                    }
                    return [];
                }
            ],
            use: true
        },
        {
            name: 'getFeaturePublications',
            type: 'object (string -> (list of string)',
            arguments: [
                function () {
                    if (results.getFeatureIds.by_type.CDS) {
                        return results.getFeatureIds.by_type.CDS.slice(0, 5);
                    }
                    return [];
                }
            ],
            use: true
        },
        {
            name: 'getFeatureDNA',
            type: 'object (string -> string)',
            arguments: [
                function () {
                    if (results.getFeatureIds.by_type.CDS) {
                        return results.getFeatureIds.by_type.CDS.slice(0, 5);
                    }
                    return [];
                }
            ],
            use: true
        },
        {
            name: 'getFeatureFunctions',
            type: 'object (string -> string)',
            arguments: [
                function () {
                    if (results.getFeatureIds.by_type.CDS) {
                        return results.getFeatureIds.by_type.CDS.slice(0, 5);
                    }
                    return [];
                }
            ],
            use: true
        },
        // does not load, check out spec and impl.
        {
            name: 'getFeatureAliases',
            type: 'object (string -> array of string)',
            arguments: [
                function () {
                    if (results.getFeatureIds.by_type.CDS) {
                        return results.getFeatureIds.by_type.CDS.slice(0, 5);
                    }
                    return [];
                }
            ],
            use: true
        },
        {
            name: 'getCDSByGene',
            type: 'array of string',
            arguments: [
                function () {
                    if (results.getFeatureIds.by_type.gene) {
                        return results.getFeatureIds.by_type.gene.slice(0, 5);
                    }
                    return [];
                }
            ],
            use: true
        },
        {
            name: 'getCDSBymRNA',
            type: 'array of string',
            arguments: [
                function () {
                    if (results.getFeatureIds.by_type.mRNA) {
                        return results.getFeatureIds.by_type.mRNA.slice(0, 5);
                    }
                    return [];
                }
            ],
            use: true
        },
        {
            name: 'getGeneByCDS',
            type: 'object(-> string)',
            arguments: [
                function () {
                    if (results.getFeatureIds.by_type.CDS) {
                        return results.getFeatureIds.by_type.CDS.slice(0, 5);
                    }
                    return [];
                }
            ],
            use: true
        }
    ];
    var objectRef = utils.getParams().objectRef;
    document.getElementById('objectRef').innerHTML = objectRef;

    var errorId = 0;
    function nextErrorId() {
        errorId += 1;
        return errorId;
    }

    var content = '<table border="1"><tr><th>Method</th><th>Result</th><th>Type</th><th>Time</th></tr>' + methods.map(function (method) {
        return '<tr data-field="' + method.name + '">' +
            '<td data-element="label" style="vertical-align: top;">' + method.name + '</td>' +
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
                var workspace = new Workspace('https://ci.kbase.us/services/ws', {
                    token: kbSession.token
                });
                return [kbSession, workspace.get_object_info_new({
                        objects: [{ref: objectRef}],
                        includeMetadata: 1,
                        ignoreErrors: 1
                    })];
            })
            .spread(function (kbSession, objectInfo) {
                var html = utils.formatValue(objectInfo);
                document.getElementById('objectinfo').innerHTML = html;
                return kbSession;
            })
            .then(function (kbSession) {
                console.log('timeout is ' + config.timeout);
                return GenomeAnnotation.make({
                    ref: objectRef,
                    url: config.genomeAnnotationUrl,
                    token: kbSession.token,
                    timeout: config.timeout
                });
            })
            .then(function (genomeAnnotation) {
                showStatus('Building methods to test...');
                var start = new Date().getTime();
                return new Promise(function (resolve, reject) {
                    function next(nextMethods) {
                        if (nextMethods.length === 0) {
                            resolve();
                            return;
                        }
                        var method = nextMethods.shift();
                        if (method.use) {
                            showField(method.name, 'Loading...');
                            var args = method.arguments && method.arguments.map(function (argument) {
                                if (typeof argument === 'function') {
                                    return argument();
                                } else {
                                    return argument;
                                }
                            });
                            genomeAnnotation[method.name].apply(genomeAnnotation, args)
                                .then(function (value) {
                                    results[method.name] = value;
                                    var elapsed = (new Date()).getTime() - start;
                                    showField(method.name, value, elapsed, {limit: method.limit});
                                    return next(nextMethods);
                                })
                                .catch(GenomeAnnotation.AttributeException, function (err) {
                                    showField(method.name, '* n/a to this object *');
                                    return next(nextMethods);
                                })
                                .catch(function (err) {
                                    var id = nextErrorId();
                                    showField(method.name, 'ERROR - see log #' + id);
                                    console.log('ERROR #' + id + ' : ' + method);
                                    console.log(err);
                                    reject(err);
                                });
                        } else {
                            next(nextMethods);
                        }
                        return null;
                    }
                    next(methods);
                });
            })
            .then(function () {
                showStatus('done');
            })
            .catch(function (err) {
                showStatus('done, with error');
                console.log('ERROR');
                if (err instanceof GenomeAnnotation.ClientException) {
                    utils.showError(err);
                } else if (err instanceof Thrift.TTransportError) {
                    utils.showError(err);
                } else if (err instanceof Thrift.TException) {
                    utils.showError({
                        name: 'ThriftException',
                        reason: err.name,
                        message: err.getMessage()
                    });
                } else if (err instanceof GenomeAnnotation.AttributeException) {
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
