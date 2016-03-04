/*global define*/
/*jslint white:true,browser:true*/
define([
    'bluebird',
    'kb/common/html',
    'kb/common/dom',
    'kb/service/utils',
    'kb/common/session',
    'kb/service/client/workspace'

], function (Promise, html, dom, serviceUtils, fSession, Workspace) {
    'use strict';
    function showResult(s) {
        document.querySelector('#result').innerHTML = s;
    }
    function hideError() {
        document.querySelector('#error').style.display = 'none';
    }
    function showErrorField(err, fieldName) {
        if (err[fieldName]) {
            var field = document.querySelector('#error  [data-field="' + fieldName + '"]');
            if (field) {
                field.innerHTML = err[field];
            } else {
                console.warn('Field ' + field + ' not defined for error display.');
            }
        }
    }
    function findProp(obj, name, value) {
        var prototype = Object.getPrototypeOf(obj);
        while (prototype) {
            if (prototype.name === value) {
                return true;
            }
            prototype = Object.getPrototypeOf(prototype);
        }
        return false;
    }
//    function showField(containerId, fieldName, value) {
//        var container = document.querySelector('#' + containerId);
//        if (!container) {
//            return;
//        }
//        var field = container.querySelector('[data-field="' + fieldName + '"]');
//        if (!field) {
//            return;
//        }
//        field.innerHTML = String(value);
//    }
//    function showError(err) {
//        showField('result', 'status', 'Error');
//        document.querySelector('#error').style.display = 'block';
//        ['type', 'title', 'reason', 'message', 'suggestions'].forEach(function (name) {
//            showErrorField(err, name);
//        });
//
//        if (err.errorObject) {
//            console.log('ERROR OBJECT');
//            console.log(err.errorObject);
//        } else {
//            console.log('ERROR');
//            console.log(err);
//        }
//    }
    function loading() {
        return '<span style="color: orange;">Loading...</style>';
    }
    function getParams() {
        var query = window.location.search, params = {};
        if (query && query.length > 4) {
            query.substring(1).split('&').forEach(function (field) {
                var l = field.split('='),
                    key = decodeURIComponent(l[0]),
                    value = decodeURIComponent(l[1]);
                params[key] = value;
            });
        }
        return params;
    }



    function formatValue(valueToFormat, options) {
        var limit = (options && options.limit) || 10;

        function objectToHtmlListItems(value, valueKeys) {
            var keys = valueKeys || Object.keys(value);
            return keys.map(function (key) {
                return '<li><i>' + key + '</i> -> ' + formatter(value[key]) + '</li>';
            }).join('\n');
        }

        function formatArray(value) {
            var len = value.length;
            if (len === 0) {
                return '* empty array *';
            }
            if (limit && len > limit) {
                value = value.slice(0, limit);
                value.push('... <i>truncated at ' + limit + ' of ' + len + ' items</i>');
            }
            return '<ol>' + value.map(function (x) {
                return '<li>' + formatter(x) + '</li>';
            }).join('\n') + '</ol>';
        }
        function formatObject(value) {
            var keys = Object.keys(value),
                len = keys.length,
                limited = {};
            if (keys.length === 0) {
                return '* empty object *';
            }
            if (limit && keys.length > limit) {
                keys = keys.slice(0, limit);
                limited['...'] = '<i>truncated at ' + limit + ' of ' + len + ' items</i>';
                //keys.push('...');
                //value['...'] = '<i>truncated at ' + limit + ' items</i>';
            }
            return '<ol>' + objectToHtmlListItems(value, keys) + objectToHtmlListItems(limited) + '</ol>';
        }

        function formatter(value) {
            if (value === undefined) {
                return '* undefined *';
            }
            if (value === null) {
                return '* null * ';
            }
            if (value.pop) {
                return formatArray(value);
            }
            if (value === '') {
                return '* empty string *';
            }
            if (typeof value === 'object') {
                return formatObject(value);
            }
            return value;
        }
        return formatter(valueToFormat);
    }
    function setContent(section, element, html) {
        var node = dom.qs('#' + section + ' [data-element="' + element + '"]');
        if (node === null) {
            console.error('Could not find element ' + section + ':' + element);
            return;
        }
        node.innerHTML = html;
    }

    function setStatus(html) {
        var node = dom.qs('#status');
        if (node === null) {
            console.error('Could not find status node');
            return;
        }
        node.innerHTML = html;
    }
    function loadType(workspace, dataApi, dataType) {
        var id = dataType.replace('.', '_');
        setStatus('Loading ' + dataType + ' type info...');
        setContent(id, 'description', loading());
        return workspace.get_type_info(dataType)
            .then(function (typeInfo) {
                setContent(id, 'description', typeInfo.description);
            })
            .then(function () {
                setStatus('Loading ' + dataType + ' object info...');
                setContent(id, 'objects', loading());
                return workspace.list_objects({
                    type: dataType,
                    includeMetadata: 1
                });
            })
            .then(function (objects) {
                setStatus('Loaded!');
                var table = html.tag('table'), tr = html.tag('tr'),
                    th = html.tag('th'), td = html.tag('td'), a = html.tag('a'),
                    listing = table({class: 'table'}, [
                        tr([
                            th('Name'),
                            th('Version'),
                            th('Workspace'),
                            th('Type Version')
                        ])].concat(objects.map(function (object) {
                        var objectInfo = serviceUtils.object_info_to_object(object);
                        return tr([
                            td(a({href: dataApi + 'AllMethods.html?objectRef=' + objectInfo.ref, target: '_blank'}, objectInfo.name)),
                            td(objectInfo.version),
                            td(objectInfo.ws),
                            td(objectInfo.typeMajorVersion + '.' + objectInfo.typeMinorVersion)
                        ]);
                    })));
                setContent(id, 'objects', listing);
                setContent(id, 'status', 'ready');
            });
    }

    function toArray(x) {
        return Array.prototype.slice.call(x);
    }

    function showField(methodName, field, value, options) {
        options = options || {};
        var displayValue = formatValue(value, options);
        var node = document.querySelector('#result [data-field="' + methodName + '"]');
        if (node) {
            toArray(node.querySelectorAll('[data-element="' + field + '"]')).forEach(function (el) {
                el.innerHTML = displayValue;
            });
        }
    }
    function showStatus(msg) {
        document.querySelector('#status').innerHTML = msg;
    }
    function setInput(id, content) {
        document.getElementById(id).value = content;
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

    function displayObject(API, methods, config) {
        var objectRef = getParams().objectRef,
            results = {}, input, client, session,
            errorId = 0,
            t = html.tag,
            table = t('table'), tr = t('tr'), th = t('th'), td = t('td'),
            methods = methods.map(function (method) {
                if (typeof method === 'string') {
                    return {
                        name: method,
                        use: true
                    };
                } 
                return method;
            }),
            content = table({border: 1}, [
                tr([
                    th('Method'),
                    th('Args'),
                    th('Type'),
                    th('Time'),
                    th('Result')
                ]),
                methods.map(function (method) {
                    return tr({dataField: method.name}, [
                        td({dataElement: 'label', style: {verticalAlign: 'top'}}, method.name),
                        td({dataElement: 'args', style: {verticalAlign: 'top'}}),
                        td({dataElement: 'type', style: {verticalAlign: 'top'}}),
                        td({dataElement: 'time', style: {verticalAlign: 'top'}}),
                        td({dataElement: 'value', style: {verticalAlign: 'top'}})
                    ]);
                })
            ]);

        document.getElementById('objectRef').innerHTML = objectRef;
        document.querySelector('#result').innerHTML = content;

        function nextErrorId() {
            errorId += 1;
            return errorId;
        }

        try {
            showStatus('Starting...');
            session = fSession.make({
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
                    document.getElementById('objectinfo').innerHTML = formatValue(objectInfo);
                    return kbSession;
                })
                .then(function (kbSession) {
                    input = {
                        ref: objectRef,
                        url: config.serviceUrl,
                        token: kbSession.token,
                        timeout: config.timeout
                    };
                    client = API.client(input);
                })
                .then(function () {
                    showStatus('Building methods to test...');
                    var start = new Date().getTime();
                    return new Promise(function (resolve, reject) {
                        function next(nextMethods) {
                            if (nextMethods.length === 0) {
                                resolve();
                                return;
                            }
                            var method = nextMethods.shift();
                            if (method.use !== false) {
                                showField(method.name, 'value', 'Loading...');
                                showField(method.name, 'type', method.type);
                                var methodArgs = method.args && method.args.map(function (argument) {
                                    if (typeof argument === 'function') {
                                        return argument(results);
                                    } 
                                    return argument;
                                });
                                showField(method.name, 'args', methodArgs);
                                results[method.name] = {
                                    type: method.type
                                };
                                client[method.name].apply(client, methodArgs)
                                    .then(function (value) {
                                        results[method.name].result = value;
                                        results[method.name].args = methodArgs;

                                        var elapsed = (new Date()).getTime() - start;
                                        showField(method.name, 'value', value);
                                        showField(method.name, 'time', elapsed);
                                        return next(nextMethods);
                                    })
                                    .catch(API.AttributeException, function (err) {
                                        results[method.name].exception = 'AttributeException';
                                        showField(method.name, 'value', '!! AttributeException: ' + err.message);
                                        return next(nextMethods);
                                    })
                                    .catch(API.TypeException, function (err) {
                                        results[method.name].exception = 'TypeException';
                                        showField(method.name, 'value', '!! Type Exception: ' + err.message);
                                        return next(nextMethods);
                                    })
                                    .catch(API.ServiceException, function (err) {
                                        results[method.name].exception = 'ServiceException';
                                        showField(method.name, 'value', '!! Service Exception: ' + err.message);
                                        return next(nextMethods);
                                    })
                                    .catch(function (err) {
                                        var id = nextErrorId();
                                        showField(method.name, 'value', 'ERROR - see log #' + id);
                                        console.log('ERROR #' + id + ' : ' + method);
                                        console.log(err);
                                        // reject(err);
                                        return next(nextMethods);
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
                .finally(function () {
                    setInput('rawresult', JSON.stringify({results: results, input: input}, null, '    '));
                })
                .catch(function (err) {
                    showStatus('done, with error');
                    console.error('ERROR');
                    console.error(err);
                    if (err instanceof API.ClientException) {
                        showError(err);
                    } else if (err instanceof API.TXHRTransportException) {
                        showError(err);
                    } else if (err instanceof API.TException) {
                        showError({
                            name: 'ThriftException',
                            reason: err.name,
                            message: err.getMessage()
                        });
                    } else if (err instanceof API.AttributeException) {
                        showError({
                            name: 'AttributeException',
                            reason: err.name,
                            message: 'This attribute is not supported for this object'
                        });
                    } else {
                        console.log(err);
                        showError({
                            type: 'UnknownError',
                            message: 'Check the browser console'
                        });
                    }
                });
        } catch (ex) {
            showError(ex);
        }
    }
    return {
        showResult: showResult,
        hideError: hideError,
        showErrorField: showErrorField,
        findProp: findProp,
        showField: showField,
        showError: showError,
        getParams: getParams,
        formatValue: formatValue,
        loadType: loadType,
        setStatus: setStatus,
        setContent: setContent,
        loading: loading,
        displayObject: displayObject
    };
});
