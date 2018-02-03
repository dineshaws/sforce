import { Router, Request, Response, NextFunction } from 'express';
import currentConnection from '../sfConnectionHandler';
import * as _ from 'underscore';
import * as async from 'async';

export class MetaDataRouter {
    router: Router

    /**
     * Initialize the OpportunityRouter
     */
    constructor() {
        this.router = Router();
        this.init();
    }

    /**
     * Take each handler, and attach to one of the Express.Router's
     * endpoints.
     */
    init() {
        this.router.post('/', this.metadataCreate);
        this.router.get('/show', this.showMetaData);
        this.router.get('/retrieve_triggers', this.retrieveTriggers);
        this.router.get('/retrieve_custom_objects', this.retrieveCustomObjects);
    }

    /**
     * 
     create metadata
    */
    metadataCreate(req, res, next) {
        console.log("metadata create api call here", req.body);
        async.waterfall([
            // create metadata here
            function (callback) {
                // creating metadata in array
                var metadata = [{
                    fullName: req.body.fullName,
                    label: req.body.label,
                    description: req.body.description,
                    frameHeight: 600,
                    mobileReady: false,
                    motif: 'Custom53: Bell',
                    url: req.body.url,
                    urlEncodingKey: 'UTF-8',
                }];
                console.log("metadata ",JSON.stringify(metadata))
                currentConnection.metadata.create('CustomTab', metadata, function (err, results) {
                    if (err) {
                        console.error("ERROR here in create metadata", JSON.stringify(err));
                        return callback(err);
                    } else if(results && results.hasOwnProperty("errors") && results.hasOwnProperty("success") && !results.success) {
                        console.error("ERROR here in create metadata in else part", results);
                        const errorMgs = results.errors.message || "Error found";
                        return callback(errorMgs);
                    } else {
                        console.log("success create results", JSON.stringify(results));
                        callback(null);
                    }
                });
            },
            // read metadata from profile
            function (callback) {
                let fullNames = ['Admin'];
                currentConnection.metadata.read('Profile', fullNames, function (err, metadata) {
                    if (err) {
                        console.error("Error in meta data read ", JSON.stringify(err));
                        return callback(err);
                    } else {
                        console.log("success read result ");
                        callback(null, metadata);
                    }
                });
            },
            //update metadata of profile, push to tabVisibilities
            function (metadata, callback) {
                let newMetaData = new Object();
                let newTabVisibilities = new Array();
                newTabVisibilities.push({ "tab": req.body.fullName, "visibility": "DefaultOn" }); // adding one more tabVisibilities
                newMetaData["fullName"] = metadata.fullName;
                newMetaData["tabVisibilities"] = newTabVisibilities;
                console.log("modified newMetaData ", JSON.stringify(newMetaData));
                currentConnection.metadata.update('Profile', newMetaData, function (err, results) {
                    if (err) {
                        console.error("Error in meta data update 1", JSON.stringify(err));
                        return callback(err);
                    } else {
                        console.log("success update result", JSON.stringify(results));
                        callback(null);
                    }
                });
            },
            // fetch customApp data here
            function (callback) {
                var fullNames = ['standard__Sales'];
                currentConnection.metadata.read('CustomApplication', fullNames, function (err, metadata) {
                    if (err) {
                        console.error("Error in meta data read customApp ", JSON.stringify(err));
                        return callback(err);
                    } else {
                        console.log("success fetched meta data here -- ", JSON.stringify(metadata));
                        callback(null, metadata);
                    }
                });
            },
            // update customApp data here
            function (metadata, callback) {
                if (metadata.hasOwnProperty("tab") && Array.isArray(metadata.tab)) {
                    metadata.tab.push(req.body.fullName);
                    currentConnection.metadata.update('CustomApplication', metadata, function (err, results) {
                        if (err) {
                            console.error("Error in meta data update customApp ", JSON.stringify(err));
                            return callback(err);
                        } else {
                            console.log("success update customApp meta data here -- ", JSON.stringify(metadata));
                            callback(null);
                        }
                    });
                } else {
                    console.log("no tab data  -- ", JSON.stringify(metadata));
                    callback(null);
                }
            }
        ], function (error) {
            if (error) {
                res.status(400).send({type:"error", message: 'Error while adding metadata.', error: error });
            } else {
                res.status(200).send({ type:"success",message: 'Successfully added.'});
            }
        });
    }


    /**
     * show meta data in dashboard forcefully
     */
    showMetaData(req, res, next) {
        console.log("metadata show  api call here", req.body);
        async.waterfall([
            // fetch customApp data here 4th
            function (callback) {
                var fullNames = ['standard__Sales'];
                currentConnection.metadata.read('CustomApplication', fullNames, function (err, metadata) {
                    if (err) {
                        console.error("Error in meta data read customApp 2", JSON.stringify(err));
                        return callback(err);
                    } else {
                        console.log("success fetched meta data here -- 2", JSON.stringify(metadata));
                        callback(null, metadata);
                    }
                });
            },
            // update customApp data here 4th
            function (metadata, callback) {
                if (metadata.hasOwnProperty("tab") && Array.isArray(metadata.tab)) {
                    currentConnection.metadata.update('CustomApplication', metadata, function (err, results) {
                        if (err) {
                            console.error("Error in meta data update customApp 2", JSON.stringify(err));
                            return callback(err);
                        } else {
                            console.log("success update customApp meta data here 2-- ", JSON.stringify(metadata));
                            callback(null);
                        }
                    });
                } else {
                    console.log("no tab data  -- ", JSON.stringify(metadata));
                    callback(null);
                }
            }
        ], function (error) {
            if (error) {
                res.status(400).send({type:"error", message: 'Error while showing metadata.', error: error });
            } else {
                res.status(200).send({ type:"success",message: 'Successfully showing.'});
            }
        });
    }

    /**
     * Retrieve Triggers 
     */
    retrieveTriggers(req, res, next) {
        console.log("metadata show  api call here", req.body);
        async.waterfall([
           // fetch customApp data here 1st
            function (callback) {
                var types = [{type: 'ApexTrigger', folder: null}];
                currentConnection.metadata.list(types, '39.0',  function (err, metadata) {
                    if (err) {
                        console.error("Error in meta data read customApp 2", JSON.stringify(err));
                        return callback(err);
                    } else {
                        console.log("\n\n metadata ",JSON.stringify(metadata))
                        console.log('metadata count: ' + metadata.length);
                        var fullNames = _.pluck(metadata, 'fullName');
                        callback(null, fullNames);
                    }
                });
            },
            // fetch customApp data here 2nd
            function (fullNames, callback) {
                console.log("fullNames ",fullNames);
                let fullname = '';
                currentConnection.tooling.sobject('ApexTrigger')
                  .find({ TableEnumOrId: "Property__c" })
                  .execute(function(err, records) {
                    if (err) { 
                        console.error(err); 
                        return callback(err);
                    }
                    console.log("fetched : " + records.length);
                    for (var i=0; i < records.length; i++) {
                      var record = records[i]; 
                      console.log("\n\n record \n\n",JSON.stringify(record));
                      console.log('Id: ' + record.Id);
                      console.log('Name: ' + record.Name);
                      console.log('FullName: ' + record.FullName);
                      fullname = record.Id;
                    }
                    callback(null, fullname);

                  });
                /*currentConnection.metadata.read('ApexTrigger', fullNames, function (err, metadata) {
                    if (err) {
                        console.error("Error in meta data read customApp 2", JSON.stringify(err));
                        return callback(err);
                    } else {
                        console.log("success fetched meta data here -- 2", JSON.stringify(metadata));
                        callback(null, metadata);
                    }
                });*/
            },
            function(fullname, callback) {
                console.log("fullname ",fullname)
                /*var metadata = [{
                  fullName: fullname,
                  status: 'Inactive'
                }]
                currentConnection.metadata.update('ApexTrigger', metadata, function(err, results) {
                  if (err) { 
                    console.error(err); 
                    return callback(err);
                  }
                  console.log("\n\n results \n\n",JSON.stringify(results));
                  for (var i=0; i < results.length; i++) {
                    var result = results[i];
                    console.log('success ? : ' + result.success);
                    console.log('fullName : ' + result.fullName);
                  }
                });*/
            }
        ], function (error, metadata) {
            if (error) {
                res.status(400).send({type:"error", message: 'Error while showing metadata.', error: error });
            } else {
                res.status(200).send({ type:"success",message: 'Successfully showing.', metadata:metadata});
            }
        });
    }

    /**
     * Retrieve Custom Objects 
     */
    retrieveCustomObjects(req, res, next) {
        console.log("custom objects metadata retireve  api call here", req.body);
        async.waterfall([
           // fetch customApp data here 1st
            function (callback) {
                var types = [{type: 'CustomObject', folder: null}];
                currentConnection.metadata.list(types, '39.0',  function (err, metadata) {
                    if (err) {
                        console.error("Error in meta data read customApp 2", JSON.stringify(err));
                        return callback(err);
                    } else {
                        console.log("\n\n CustomObject ",JSON.stringify(metadata))
                        console.log('CustomObject count: ' + metadata.length);
                        var fullNames = _.pluck(metadata, 'fullName');
                        callback(null, fullNames);
                    }
                });
            },
            // fetch customApp data here 2nd
            function (fullNames, callback) {
                console.log("fullNames ",fullNames);
                /*let fullname = '';
                currentConnection.tooling.sobject('CustomObject')
                  .find({ TableEnumOrId: "Property__c" })
                  .execute(function(err, records) {
                    if (err) { 
                        console.error(err); 
                        return callback(err);
                    }
                    console.log("fetched : " + records.length);
                    for (var i=0; i < records.length; i++) {
                      var record = records[i]; 
                      console.log("\n\n record \n\n",JSON.stringify(record));
                      console.log('Id: ' + record.Id);
                      console.log('Name: ' + record.Name);
                      console.log('FullName: ' + record.FullName);
                      fullname = record.Id;
                    }
                    callback(null, fullname);

                  });*/
                currentConnection.metadata.read('CustomObject', ["Property__c"], function (err, metadata) {
                    if (err) {
                        console.error("Error in meta data read customApp 2", JSON.stringify(err));
                        return callback(err);
                    } else {
                        console.log("success fetched meta data here -- 2", JSON.stringify(metadata));
                        callback(null, metadata);
                    }
                });
            },
            function(fullname, callback) {
                console.log("fullname ",fullname)
                /*var metadata = [{
                  fullName: fullname,
                  status: 'Inactive'
                }]
                currentConnection.metadata.update('ApexTrigger', metadata, function(err, results) {
                  if (err) { 
                    console.error(err); 
                    return callback(err);
                  }
                  console.log("\n\n results \n\n",JSON.stringify(results));
                  for (var i=0; i < results.length; i++) {
                    var result = results[i];
                    console.log('success ? : ' + result.success);
                    console.log('fullName : ' + result.fullName);
                  }
                });*/
            }
        ], function (error, metadata) {
            if (error) {
                res.status(400).send({type:"error", message: 'Error while showing metadata.', error: error });
            } else {
                res.status(200).send({ type:"success",message: 'Successfully showing.', metadata:metadata});
            }
        });
    }
}

//create object and export router
const metaDataRouter = new MetaDataRouter();
metaDataRouter.init();

export default metaDataRouter.router;