/**
 * @module Taxon
 * @author Erik Pearson
 * @version 0.1.0
 * @param {TaxonLibrary} taxon
 * @param {TriftLibrary} Thrift
 * @param {BluebirdPromise} Promise
 * @returns {Taxon_L12.factory}
 */
/*global define*/
/*jslint white: true, browser: true*/
define([
    './annotation/thrift_service',
    'thrift',
    './common',
    // These don't have representations. Loading them causes the Thrift module
    // to be enhanced with additional properties (typically just a single
    //  property, the new capability added.)
    'thrift_transport_xhr',
    'thrift_protocol_binary'
], function (annotation, Thrift, common) {
    'use strict';

    /**
     * Represents an interface to the Taxon data service.
     * @alias module:Taxon
     * @constructs Taxon
     * @param {object} config
     * @param {ObjectReference} config.ref The object reference for the object to be accessed.
     * @param {string} config.url The url for the Taxon Service endpoint.
     * @param {string} config.token The KBase authorization token to be used to access the service.
     * @returns {Taxon} A taxon api object
     */
    function makeAnnotationClient(config) {
        var objectReference,
            serviceUrl,
            authToken,
            timeout;
        
        common.validateCommonApiArgs(config);
        
        objectReference = config.ref;
        serviceUrl = config.url;
        authToken = config.token;
        timeout = config.timeout;
 
        /**
         * Creates and returns an instance of the Assembly Thrift client. Note that
         * this is
         *
         * @returns {Taxon_L22.assembly.thrift_serviceClient}
         * @private
         * @ignore
         */
        function client() {
            try {
                var transport = new Thrift.TXHRTransport(serviceUrl, {timeout: timeout}),
                    protocol = new Thrift.TBinaryProtocol(transport),
                    thriftClient = new annotation.thrift_serviceClient(protocol);
                return thriftClient;
            } catch (ex) {
                // Rethrow exceptions in our format:
                if (ex.type && ex.name) {
                    throw ex;
                }
                throw new common.ThriftClientException({
                    type: 'ThriftError',
                    message: 'An error was encountered creating the thrift client objects',
                    suggestion: 'This could be a configuration or runtime error. Please consult the console for the error object',
                    errorObject: ex
                });
            }
        }


        /**
         *  Retrieve the Taxon associated with this GenomeAnnotation.
         *
         * @returns {Promise String} 
         *
         */
        function getTaxon() {
            return client().get_taxon(authToken, objectReference, true)
                .catch(annotation.AttributeException, function (err) {
                    return;
                });
        }

        /**
         *   Retrieve the Assembly associated with this GenomeAnnotation.
         *
         * @returns {Promise String} 
         */
        function getAssembly() {
            return client().get_assembly(authToken, objectReference, true)
                .catch(annotation.AttributeException, function (err) {
                    return;
                });
        }

        /**
         * Retrieve the list of Feature types in this GenomeAnnotation.
         * 
         * @returns {Promise Array<String>} 
         */
        function getFeatureTypes() {
            return client().get_feature_types(authToken, objectReference, true)
                .catch(annotation.AttributeException, function (err) {
                    return;
                });
        }

        /**
         * Retrieve the descriptions for each Feature type in this GenomeAnnotation.
         *
         * @retrns {Promise Object<string,string>}
         */
        function getFeatureTypeDescriptions() {
            return client().get_feature_type_descriptions(authToken, objectReference, true)
                .catch(annotation.AttributeException, function (err) {
                    return;
                });
        }

        /**
         * Retrieve the number of contigs for this Assembly.
         
         * @returns {Object<string,number>}
         */
        function getFeatureTypeCounts() {
            return client().get_feature_type_counts(authToken, objectReference, true)
                .catch(annotation.AttributeException, function (err) {
                    return;
                });
        }
        
        /*
         * 
         * @typedef FeatureIdMapping
         * struct Feature_id_mapping {
    1: map<string, list<string>> by_type = empty;
    2: map<string, map<string, map<string, list<string>>>> by_region = empty;
    3: map<string, list<string>> by_function = empty;
    4: map<string, list<string>> by_alias = empty;
}
         */

        /**
         * Retrieve the total GC content for this Assembly.
         
         * @returns {Promise FeatureIdMapping}
         */
        function getFeatureIds() {
            return client().get_feature_ids(authToken, objectReference, true)
                .catch(annotation.AttributeException, function (err) {
                    return;
                });
        }

        /**
         * Retrieve the total DNA size for this Assembly.
         
         * @returns {Promise Object<string, FeatureData}
         */
        function getFeatures() {
            return client().get_features(authToken, objectReference, true)
                .catch(annotation.AttributeException, function (err) {
                    return;
                });
        }

        /**
         * The NCBI genetic code for the species.
         *
         * @returns {List<String>}
         */
        function getProteins() {
            return client().get_proteins(authToken, objectReference, true)
                .catch(annotation.AttributeException, function (err) {
                    return;
                });
        }

        


        // API
        return Object.freeze({
            getTaxon: getTaxon,
            getAssembly: getAssembly,
            getFeatureTypes: getFeatureTypes,
            getFeatureTypeDescriptions: getFeatureTypeDescriptions,
            getFeatureTypeCounts: getFeatureTypeCounts,
            getFeatureIds: getFeatureIds,
            getFeatures: getFeatures,
            getProteins: getProteins
        });
    }

    return Object.freeze({
        make: function (config) {
            return makeAssemblyClient(config);
        },
        makeClient: function (config) {
            return makeAssemblyClient(config);
        },
        TaxonClientException: common.TaxonClientException,
        ServiceException: annotation.ServiceException,
        AuthorizationException: annotation.AuthorizationException,
        AuthenticationException: annotation.AuthenticationException,
        ObjectReferenceException: annotation.ObjectReferenceException,
        AttributeException: annotation.AttributeException,
        TypeException: annotation.TypeException
    });
});