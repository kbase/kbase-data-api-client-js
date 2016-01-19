/*global define*/
/*jslint white: true*/
define([    
    'kb/common/html',
    'kb/common/dom',
    'kb/service/utils'
], function (html, dom, serviceUtils) {
    'use strict';
    function showResult(s) {
        document.querySelector('#result').innerHTML = s;
    }
    function hideError() {
        document.querySelector('#error').style.display = 'none';
    }
    function showErrorField(err, field) {
        if (err[field]) {
            // document.querySelector('#error  [data-field="' + field + '"]').style.display = 'block';
            // console.log(document.querySelector('#error  [data-field="' + field + '"]'));
            var field = document.querySelector('#error  [data-field="' + field + '"]');
            if (field) {
                field.innerHTML = err[field];
            } else {
                console.warn('Field ' + field + ' not defined for error display.');
            }
        } else {
            // document.querySelector('#error  [data-field="' + field + '"]').style.display = 'none';
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
    function showField(containerId, fieldName, value) {
        var container = document.querySelector('#' + containerId);
        if (!container) {
            return;
        }
        var field = container.querySelector('[data-field="' + fieldName + '"]');
        if (!field) {
            return;
        }
        field.innerHTML = String(value);
    }
    function showError(err) {
        showField('result', 'status', 'Error');
        document.querySelector('#error').style.display = 'block';
        ['type', 'title', 'reason', 'message', 'suggestions'].forEach(function (name) {
            showErrorField(err, name);
        });

        if (err.errorObject) {
            console.log('ERROR OBJECT');
            console.log(err.errorObject);
        } else {
            console.log('ERROR');
            console.log(err);
        }
    }
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
        
        function formatter(value) {
            if (value === undefined) {
                return '* undefined *';
            }
            if (value === null) {
                return '* null * ';
            }
            if (value.pop) {
                if (value.length === 0) {
                    return '* empty array *';
                }
                if (value.length > limit) {
                    value = value.slice(0, limit);
                    value.push('... <i>truncated at ' + limit + ' items</i>');
                }
                return '<ol>' + value.map(function (x) {
                    return '<li>' + formatter(x) + '</li>';
                }).join('\n') + '</ol>';
            }
            if (value === '') {
                return '* empty string *';
            }
            if (typeof value === 'object') {
                var keys = Object.keys(value);
                if (keys.length === 0) {
                    return '* empty object *';
                }            
                if (keys.length > limit) {
                    keys = keys.slice(0, limit);
                    keys.push('...');
                    value['...'] = '<i>truncated at ' + limit + ' items</i>';
                }
                return '<ol>' + keys.map(function (key) {
                    return '<li><i>' + key + '</i> -> ' + formatter(value[key]) + '</li>';
                }).join('\n') + '</ol>';
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
        loading: loading
    };
});
