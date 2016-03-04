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
    'kb/thrift/core',
    './common',

    // These don't have representations. Loading them causes the Thrift module
    // to be enhanced with additional properties (typically just a single
    //  property, the new capability added.)
    'kb/thrift/transport/xhr',
    'kb/thrift/protocol/binary'
], function (assembly, Thrift, common) {
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
            serviceUrl,
            authToken,
            timeout;
        
        common.validateCommonApiArgs(config);

        objectReference = config.ref;
        serviceUrl = config.url;
        authToken = config.token;
        timeout = config.timeout;


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
                var transport = new Thrift.TXHRTransport(serviceUrl, {timeout: timeout}),
                    protocol = new Thrift.TBinaryProtocol(transport),
                    thriftClient = new assembly.thrift_serviceClient(protocol);
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


        /**
         *  Retrieve Assembly identifier string.
         *
         * @returns {Promise<String>} 
         *
         */
        function assembly_id() {
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
        function genome_annotations() {
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
        function external_source_info() {
            return client().get_external_source_info(authToken, objectReference, true)
                .catch(assembly.AttributeException, function () {
                    return undefined;
                });
        }

        /**
         Retrieve the Assembly stats.
         
         */
        function stats() {
            return client().get_stats(authToken, objectReference, true)
                .catch(assembly.AttributeException, function () {
                    return undefined;
                });
        }


        /**
         * Retrieve the number of contigs for this Assembly.
         
         * @returns {Number}
         */
        function number_contigs() {
            return client().get_number_contigs(authToken, objectReference, true)
                .catch(assembly.AttributeException, function () {
                    return undefined;
                });
        }

        /**
         * Retrieve the total GC content for this Assembly.
         
         * @returns {Number}
         */
        function gc_content() {
            return client().get_gc_content(authToken, objectReference, true)
                .catch(assembly.AttributeException, function () {
                    return undefined;
                });
        }

        /**
         * Retrieve the total DNA size for this Assembly.
         
         * @returns {Number}
         */
        function dna_size() {
            return client().get_dna_size(authToken, objectReference, true)
                .catch(assembly.AttributeException, function () {
                    return undefined;
                });
        }

        /**
         * The NCBI genetic code for the species.
         *
         * @returns {List<String>}
         */
        function contig_ids() {
            return client().get_contig_ids(authToken, objectReference, true)
                .catch(assembly.AttributeException, function () {
                    return undefined;
                });
        }

        /**
         *
         * @returns {Map<String,Number>}
         */
        function contig_lengths(contigs) {
            return client().get_contig_lengths(authToken, objectReference, contigs, true)
                .catch(assembly.AttributeException, function (err) {
                    return undefined;
                });
        }

        /**
         *
         * @returns {Map<String,Number>}
         */
        function contig_gc_content(contigs) {
            return client().get_contig_gc_content(authToken, objectReference, contigs, true)
                .catch(assembly.AttributeException, function () {
                    return undefined;
                });
        }


        /**
         *
         * @returns {Map<String,AssemblyContig>}
         */
        function contigs(contigs) {
            return client().get_contigs(authToken, objectReference, contigs, true)
                .catch(assembly.AttributeException, function () {
                    return undefined;
                });
        }


        // API
        return Object.freeze({
            assembly_id: assembly_id,
            genome_annotations: genome_annotations,
            external_source_info: external_source_info,
            stats: stats,
            number_contigs: number_contigs,
            gc_content: gc_content,
            dna_size: dna_size,
            contig_ids: contig_ids,
            contig_lengths: contig_lengths,
            contig_gc_content: contig_gc_content,
            contigs: contigs
        });
    }

    var api = {
        client: function (config) {
            return makeAssemblyClient(config);
        },
        ClientException: common.ClientException,
        ServiceException: assembly.ServiceException,
        AuthorizationException: assembly.AuthorizationException,
        AuthenticationException: assembly.AuthenticationException,
        ObjectReferenceException: assembly.ObjectReferenceException,
        AttributeException: assembly.AttributeException,
        TypeException: assembly.TypeException
    };
    
    for (var propKey in Thrift) {
        if (propKey.match(/Exception$/)) {
            api[propKey] = Thrift[propKey];
        }
    }
    return Object.freeze(api);   
});