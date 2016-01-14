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
    './assembly/thrift_service',
    'thrift',
    // These don't have representations. Loading them causes the Thrift module
    // to be enhanced with additional properties (typically just a single
    //  property, the new capability added.)
    'thrift_transport_xhr',
    'thrift_protocol_binary'
], function (assembly, Thrift) {
    'use strict';

    var AssemblyException = function (reason, message, suggestion) {
        this.name = 'AssemblyException';
        this.reason = reason;
        this.message = message;
        this.suggestion = suggestion;
    };
    AssemblyException.prototype = Object.create(Thrift.TException.prototype);
    AssemblyException.prototype.constructor = AssemblyException;

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
    function makeAssemblyClient(config) {
        var objectReference,
            dataAPIUrl,
            authToken,
            timeout;

        // Construction argument contract enforcement, throw useful exceptions
        if (!config) {
            throw new AssemblyException({
                type: 'ArgumentError',
                name: 'ConfigurationObjectMissing',
                message: 'Configuration object missing',
                suggestion: 'This is an API usage error; the taxon factory object is required to have a single configuration object as an argument.'
            });
        }
        objectReference = config.ref;
        if (!objectReference) {
            throw new AssemblyException({
                type: 'ArgumentError',
                name: 'ObjectReferenceMissing',
                message: 'Object reference "ref" missing',
                suggestion: 'The object reference is provided as in the "ref" argument to the config property'
            });
        }
        dataAPIUrl = config.url;
        if (!dataAPIUrl) {
            throw new AssemblyException({
                type: 'ArgumentError',
                name: 'UrlMissing',
                message: 'Cannot find a url for the data api',
                suggestion: 'The url is provided as in the "url" argument property'
            });

        }
        authToken = config.token;
        if (!authToken) {
            throw new AssemblyException({
                type: 'ArgumentError',
                name: 'AuthTokenMissing',
                message: 'No Authorization found; Authorization is required for the data api',
                suggestion: 'The authorization is provided in the "token" argument" property'
            });
        }
        timeout = config.timeout;
        if (!timeout) {
            timeout = 30000;
        }

        /**
         * Creates and returns an instance of the Taxon Thrift client. Note that
         * this is
         *
         * @returns {Taxon_L22.assembly.thrift_serviceClient}
         * @private
         * @ignore
         */
        function client() {
            try {
                var transport = new Thrift.TXHRTransport(dataAPIUrl, {timeout: timeout}),
                    protocol = new Thrift.TBinaryProtocol(transport),
                    thriftClient = new assembly.thrift_serviceClient(protocol);
                return thriftClient;
            } catch (ex) {
                // Rethrow exceptions in our format:
                if (ex.type && ex.name) {
                    throw ex;
                }
                throw new AssemblyException({
                    type: 'ThriftError',
                    message: 'An error was encountered creating the thrift client objects',
                    suggestion: 'This could be a configuration or runtime error. Please consult the console for the error object',
                    errorObject: ex
                });
            }
        }


        /**
         *  Retrieve Assembly identifier string.
         *
         * @returns {Promise<String>} 
         *
         */
        function getAssemblyId() {
            return client().get_assembly_id(authToken, objectReference, true)
                .catch(assembly.AttributeException, function (err) {
                    return undefined;
                });
        }

        /**
         * Retrieve associated GenomeAnnotation objects.
         *
         * @returns {Array<ObjectReference>} 
         */
        function getGenomeAnnotation() {
            return client().get_genome_annotations(authToken, objectReference, true)
                .catch(assembly.AttributeException, function (err) {
                    return undefined;
                });
        }

        /**
         * 
         * @typedef AssemblyExternalSourceInfo
         * struct AssemblyStats {
         1: i64 num_contigs;
         2: i64 dna_size;
         3: double gc_content;
         }
         
         struct AssemblyExternalSourceInfo {
         1: string external_source;
         2: string external_source_id;
         3: string external_source_origination_date;
         }
         
         struct AssemblyContig {
         1: string contig_id;
         2: string sequence;
         3: i64 length;
         4: string md5;
         5: string name;
         6: string description;
         7: bool is_complete;
         8: bool is_circular;
         }
         
         * 
         */

        /**
         *
         * @returns {AssemblyExternalSourceInfo} 
         */
        function getExternalSourceInfo() {
            return client().get_external_source_info(authToken, objectReference, true)
                .catch(assembly.AttributeException, function (err) {
                    return undefined;
                });
        }

        /**
         Retrieve the Assembly stats.
         
         */
        function getStats() {
            return client().get_stats(authToken, objectReference, true)
                .catch(assembly.AttributeException, function (err) {
                    return undefined;
                });
        }


        /**
         * Retrieve the number of contigs for this Assembly.
         
         * @returns {Number}
         */
        function getNumberContigs() {
            return client().get_number_contigs(authToken, objectReference, true)
                .catch(assembly.AttributeException, function (err) {
                    return undefined;
                });
        }

        /**
         * Retrieve the total GC content for this Assembly.
         
         * @returns {Number}
         */
        function getGCContent() {
            return client().get_gc_content(authToken, objectReference, true)
                .catch(assembly.AttributeException, function (err) {
                    return undefined;
                });
        }

        /**
         * Retrieve the total DNA size for this Assembly.
         
         * @returns {Number}
         */
        function getDNASize() {
            return client().get_dna_size(authToken, objectReference, true)
                .catch(assembly.AttributeException, function (err) {
                    return undefined;
                });
        }

        /**
         * The NCBI genetic code for the species.
         *
         * @returns {List<String>}
         */
        function getContigIds() {
            return client().get_contig_ids(authToken, objectReference, true)
                .catch(assembly.AttributeException, function (err) {
                    return undefined;
                });
        }

        /**
         *
         * @returns {Map<String,Number>}
         */
        function getContigLengths(contigs) {
            return client().get_contig_lengths(authToken, objectReference, contigs, true)
                .then(function (result) {
                    return result;
                })
                .catch(assembly.AttributeException, function (err) {
                    return undefined;
                });
        }

        /**
         *
         * @returns {Map<String,Number>}
         */
        function getContigGCContent(contigs) {
            return client().get_contig_gc_content(authToken, objectReference, contigs, true)
                .catch(assembly.AttributeException, function (err) {
                    return undefined;
                });
        }


        /**
         *
         * @returns {Map<String,AssemblyContig>}
         */
        function getContigs(contigs) {
            return client().get_contigs(authToken, objectReference, contigs, true)
                .catch(assembly.AttributeException, function (err) {
                    return undefined;
                });
        }


        // API
        return Object.freeze({
            getAssemblyId: getAssemblyId,
            getGenomeAnnotation: getGenomeAnnotation,
            getExternalSourceInfo: getExternalSourceInfo,
            getStats: getStats,
            getNumberContigs: getNumberContigs,
            getGCContent: getGCContent,
            getDNASize: getDNASize,
            getContigIds: getContigIds,
            getContigLengths: getContigLengths,
            getContigGCContent: getContigGCContent,
            getContigs: getContigs
        });
    }

    return Object.freeze({
        make: function (config) {
            return makeAssemblyClient(config);
        },
        makeClient: function (config) {
            return makeAssemblyClient(config);
        },
        AssemblyException: AssemblyException,
        ServiceException: assembly.ServiceException,
        AuthorizationException: assembly.AuthorizationException,
        AuthenticationException: assembly.AuthenticationException,
        ObjectReferenceException: assembly.ObjectReferenceException,
        AttributeException: assembly.AttributeException,
        TypeException: assembly.TypeException
    });
});