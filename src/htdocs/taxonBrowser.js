/*global require*/
/*jslint white:true,browser:true*/
require([
    'kb/common/dom',
    'kb/common/html',
    'kb/common/session',
    'kb/service/client/Workspace',
    'kb/service/utils',
    'yaml!config/config.yml'
], function (dom, html, Session, Workspace, serviceUtils, config) {
    var session = Session.make({
        cookieName: config.cookieName,
        loginUrl: config.loginUrl
    }),
        workspace;

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

    function loading() {
        return '<span style="color: orange;">Loading...</style>';
    }

    setContent('genomebrowser', 'status', loading());

    setContent('taxonbrowser', 'status', loading());

    setStatus('Logging in...');

    function loadType(id, type) {
        setStatus('Loading ' + type + ' type info...');
        setContent(id, 'description', loading());
        return workspace.get_type_info(type)
            .then(function (typeInfo) {
                setContent(id, 'description', typeInfo.description);
            })
            .then(function () {
                setStatus('Loading ' + type + ' object info...');
                setContent(id, 'objects', loading());
                return workspace.list_objects({
                    type: type,
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
                            td(a({href: 'taxonAllMethods.html?objectRef=' + objectInfo.ref, target: '_blank'}, objectInfo.name)),
                            td(objectInfo.version),
                            td(objectInfo.ws),
                            td(objectInfo.typeMajorVersion + '.' + objectInfo.typeMinorVersion)
                        ]);
                    })));
                setContent(id, 'objects', listing);
                setContent(id, 'status', 'ready');
            });
    }

    session.login({
        username: config.username,
        password: config.password
    })
        .then(function (kbSession) {
            workspace = new Workspace('https://ci.kbase.us/services/ws', {
                token: kbSession.token
            });

        })
        .then(function () {
            return loadType('genomebrowser', 'KBaseGenomes.Genome');
        })
        .then(function () {
            return loadType('taxonbrowser', 'KBaseGenomeAnnotations.Taxon');
        })
        .catch(function (err) {
            console.error('ERROR');
            console.error(err);
        });
});