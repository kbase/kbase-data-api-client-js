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
    './genomeAnnotation/thrift_service',
    'kb/thrift/core',
    './common',
    // These don't have representations. Loading them causes the Thrift module
    // to be enhanced with additional properties (typically just a single
    //  property, the new capability added.)
    'kb/thrift/transport/xhr',
    'kb/thrift/protocol/binary'
], function (genomeAnnotation, Thrift, common) {
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
    function makeClient(config) {
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
         * @returns {}
         * @private
         * @ignore
         */
        function client() {
            try {
                var transport = new Thrift.TXHRTransport(serviceUrl, {timeout: timeout}),
                    protocol = new Thrift.TBinaryProtocol(transport),
                    thriftClient = new genomeAnnotation.thrift_serviceClient(protocol);
                return thriftClient;
            } catch (ex) {
                // Rethrow exceptions in our format:
                if (ex.type && ex.name) {
                    throw ex;
                }
                throw new common.ClientException({
                    type: 'ThriftError',
                    message: 'An error was encountered creating the thrift client objects',
                    suggestion: 'This could be a configuration or runtime error. Please consult the console for the error object',
                    errorObject: ex
                });
            }
        }
        
        // TYPES
        
        var FeatureIdFilters = genomeAnnotation.Feature_id_filters;
        

        /**
         *  Retrieve the Taxon associated with this GenomeAnnotation.
         *
         * @returns {Promise String} 
         *
         */
        function taxon() {
            return client().get_taxon(authToken, objectReference, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         *   Retrieve the Assembly associated with this GenomeAnnotation.
         *
         * @returns {Promise String} 
         */
        function assembly() {
            return client().get_assembly(authToken, objectReference, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         * Retrieve the list of Feature types in this GenomeAnnotation.
         * 
         * @returns {Promise Array<String>} 
         */
        function feature_types() {
            return client().get_feature_types(authToken, objectReference, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         * Retrieve the descriptions for each Feature type in this GenomeAnnotation.
         *
         * @returns {Promise Object<string,string>}
         */
        function feature_type_descriptions(featureTypeList) {
            return client().get_feature_type_descriptions(authToken, objectReference, featureTypeList, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         * Retrieve the count of each Feature type in this GenomeAnnotation.
         
         * @returns {Object<string,number>}
         */
        // HMM skip for now...
        function feature_type_counts(featureTypeList) {
            return client().get_feature_type_counts(authToken, objectReference, featureTypeList, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /*
         * 
         * @typedef FeatureIdMapping
         
         struct Feature_id_mapping {
         1: map<string, list<string>> by_type = empty;
         2: map<string, map<string, map<string, list<string>>>> by_region = empty;
         3: map<string, list<string>> by_function = empty;
         4: map<string, list<string>> by_alias = empty;
         }
         
         struct Feature_id_filters {
         1: list<string> type_list = [];
         2: list<Region> region_list = [];
         3: list<string> function_list = [];
         4: list<string> alias_list = [];
         }        
         
         */

        /**
         * Retrieve Feature ids in this GenomeAnnotation, optionally filtered by type, region, function, alias.
         
         * @returns {Promise FeatureIdMapping}
         */
        function feature_ids(featureIdFilters, groupType) {
            var filters, regions;
            
            if (featureIdFilters.hasOwnProperty("region_list")) {
                // convert basic object for regions to thrift expected type
                regions = featureIdFilters.region_list.map(function (region_element) {
                    return new genomeAnnotation.Region(region_element);
                });
                
                featureIdFilters.region_list = regions;
            }
            
            filters = new FeatureIdFilters(featureIdFilters);
            return client().get_feature_ids(authToken, objectReference, filters, groupType, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         * Retrieve Feature data available in this GenomeAnnotation.
         
         * @returns {Promise Object<string, FeatureData}
         */
        function features(featureIdList) {
            return client().get_features(authToken, objectReference, featureIdList, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         * Retrieve Protein data available in this GenomeAnnotation.
         *
         * @returns {List<String>}
         */
        function proteins() {
            return client().get_proteins(authToken, objectReference, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         * Retrieve Feature locations in this GenomeAnnotation.
         *
         * @returns {Promise Object(string -> Array(Region))}
         */
        function feature_locations(featureIdList) {
            return client().get_feature_locations(authToken, objectReference, featureIdList,true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         * Retrieve Feature publications in this GenomeAnnotation.
         *
         * @returns {Promise Object(string -> Array(Region))}
         */
        function feature_publications(featureIdList) {
            return client().get_feature_publications(authToken, objectReference, featureIdList, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         * Retrieve Feature DNA sequences in this GenomeAnnotation.
         *
         * @returns {Promise Object(string -> string)}
         */
        function feature_dna(featureIdList) {
            return client().get_feature_dna(authToken, objectReference, featureIdList, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         * Retrieve the mRNA id for each Gene id in this GenomeAnnotation.
         *
         * @returns {Promise Object(string -> string)}
         */
        function feature_functions(featureIdList) {
            return client().get_feature_functions(authToken, objectReference, featureIdList, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }
        
        /**
         * Retrieve the mRNA id for each Gene id in this GenomeAnnotation.
         *
         * @returns {Array(string -> List(String))}
         */
        function feature_aliases(featureIdList) {
            return client().get_feature_aliases(authToken, objectReference, featureIdList, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         * Retrieve the CDS id for each Gene id in this GenomeAnnotation.
         *
         * @param {Array<String>}
         *
         * @returns {Promise List<ObjectRef>}
         */
        function cds_by_gene(geneIdList) {
            return client().get_cds_by_gene(authToken, objectReference, geneIdList, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         * Retrieve the CDS id for each mRNA id in this GenomeAnnotation.
         *
         * @param {Array<String>}
         *
         * @returns {Promise List<ObjectRef>}
         */
        function cds_by_mrna(mRNAIdist) {
            return client().get_cds_by_mrna(authToken, objectReference, mRNAIdist, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         * Retrieve the Gene id for each mRNA id in this GenomeAnnotation.
         *
         * @param {Array<String>}
         *
         * @returns {Promise List<ObjectRef>}
         */
        function gene_by_cds(CDSIdList) {
            return client().get_gene_by_cds(authToken, objectReference, CDSIdList, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         * Retrieve the Gene id for each mRNA id in this GenomeAnnotation.
         *
         * @param {Array<String>}
         *
         * @returns {Promise List<ObjectRef>}
         */
        function gene_by_mrna(mRNAIdList) {
            return client().get_gene_by_mrna(authToken, objectReference, mRNAIdList, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         * Retrieve the mRNA id for each CDS id in this GenomeAnnotation.
         *
         * @param {Array<String>}
         *
         * @returns {Promise List<ObjectRef>}
         */
        function mrna_by_cds(cdsIdList) {
            return client().get_mrna_by_cds(authToken, objectReference, cdsIdList, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         * Retrieve the mRNA id for each Gene id in this GenomeAnnotation.
         *
         * @param {Array<String>}
         *
         * @returns {Promise List<ObjectRef>}
         */
        function mrna_by_gene(geneIdList) {
            return client().get_mrna_by_gene(authToken, objectReference, geneIdList, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }

        /**
         *  Retrieve a summary for this GenomeAnnotation.
         *
         * @returns {Promise ObjectRef} 
         *
         */
        function summary() {
            return client().get_summary(authToken, objectReference, true)
                .catch(genomeAnnotation.AttributeException, function () {
                    return;
                });
        }
        
        // API
        return Object.freeze({
            taxon: taxon,
            assembly: assembly,
            feature_types: feature_types,
            feature_type_descriptions: feature_type_descriptions,
            feature_type_counts: feature_type_counts,
            feature_ids: feature_ids,
            features: features,
            proteins: proteins,
            feature_locations: feature_locations,
            feature_publications: feature_publications,
            feature_dna: feature_dna,
            feature_functions: feature_functions,
            feature_aliases: feature_aliases,
            cds_by_gene: cds_by_gene,
            cds_by_mrna: cds_by_mrna,
            gene_by_cds: gene_by_cds,
            gene_by_mrna: gene_by_mrna,
            mrna_by_cds: mrna_by_cds,
            mrna_by_gene: mrna_by_gene,
            summary: summary
        });
    }

    var api = {
        client: function (config) {
            return makeClient(config);
        },
        ClientException: common.ClientException,
        ServiceException: genomeAnnotation.ServiceException,
        AuthorizationException: genomeAnnotation.AuthorizationException,
        AuthenticationException: genomeAnnotation.AuthenticationException,
        ObjectReferenceException: genomeAnnotation.ObjectReferenceException,
        AttributeException: genomeAnnotation.AttributeException,
        TypeException: genomeAnnotation.TypeException
    };
    
    for (var propKey in Thrift) {
        if (propKey.match(/Exception$/)) {
            api[propKey] = Thrift[propKey];
        }
    }
    return Object.freeze(api);    
});
