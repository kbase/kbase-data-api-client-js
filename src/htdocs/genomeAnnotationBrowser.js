/*global require*/
/*jslint white:true,browser:true*/
require([    
    'kb/common/session',
    'kb/service/client/Workspace',
    'htdocs/utils',
    'yaml!config/config.yml'
], function (Session, Workspace, utils, config) {
    'use strict';
    var session = Session.make({
        cookieName: config.cookieName,
        loginUrl: config.loginUrl
    }),
        workspace;

    utils.setContent('KBaseGenomes_Genome', 'status', utils.loading());
    utils.setContent('KBaseGenomeAnnotations_GenomeAnnotation', 'status', utils.loading());
    utils.setStatus('Logging in...');
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
            return utils.loadType(workspace, 'genomeAnnotation', 'KBaseGenomes.Genome');
        })
        .then(function () {
            return utils.loadType(workspace, 'genomeAnnotation', 'KBaseGenomeAnnotations.GenomeAnnotation');
        })
        .catch(function (err) {
            console.error('ERROR');
            console.error(err);
        });
});