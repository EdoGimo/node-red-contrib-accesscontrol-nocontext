module.exports = function (RED) {
    function RemoveNode(config) {
        RED.nodes.createNode(this, config);

        //options
        this.role = config.role;
        this.roleType = config.roleType;
        this.resource = config.resource;
        this.resourceType = config.resourceType;
        this.force = config.force;

        //MAIN code
        var node = this;
        node.on('input', function (msg, send, done) {

            try {

                //cannot leave both empty
                if (!node.role && !node.resource) {
                    throw new Error("Define at least one between role and resource.");
                }

                var roleField = splitArray(node.role, node.roleType, msg);
                
                var resourceField = splitArray(node.resource, node.resourceType, msg);


                //cannot insert both role and resource
                if (roleField && resourceField) {
                    throw new Error("Define only one between role and resource.");
                }

                //cannot leave both empty
                if (!roleField && !resourceField) {
                    throw new Error("Define at least one between role and resource.");
                }

                const ac = msg.accesscontrol;

                if (!ac) {
                    throw new Error("AccessControl instance non-existent. Set it with 'AC init' first.");
                }


                var missing = new Array();

                //IF role is selected
                if (roleField) {

                    //IF it is an array
                    if (Array.isArray(roleField)) {
                        roleField.forEach(function (element) {

                            //check if the values are present
                            if (!ac.hasRole(element)) {

                                node.warn("Role " + element + " not found.");
                                missing.push(element);
                            }
                        });

                        //if there was a missing role and force was NOT set, do not proceed with removal
                        if (missing.length > 0 && !node.force) {
                            throw new Error("Removal interrupted for missing role(s).");

                        //if there was a missing role and force was set, proceed with removal
                        } else if (missing.length > 0) {
                            roleField = roleField.filter((el) => !missing.includes(el));

                            if (roleField.length > 0) {
                                ac.removeRoles(roleField);
                            } else {
                                throw new Error("Nothing to remove.");
                            }

                        //if all roles are present, proceed with removal
                        } else {
                            ac.removeRoles(roleField);
                        }

                        //check if the values have been removed
                        if (ac.hasRole(roleField)) {
                            throw new Error("Roles were unexpectedly not removed.");
                        }

                    //IF it is NOT an array
                    } else {

                        //check if the value is present
                        if (!ac.hasRole(roleField)) {
                            throw new Error("Role not found.");
                        }

                        ac.removeRoles(roleField);

                        //check if the value has been removed
                        if (ac.hasRole(roleField)) {
                            throw new Error("Role was unexpectedly not removed.");
                        }
                    }

                    //LOG
                    node.log( logInfo('role', roleField) );
                }


                //IF resource is selected
                if (resourceField) {

                    //IF it is an array
                    if (Array.isArray(resourceField)) {
                        resourceField.forEach(function (element) {

                            //check if the values are present
                            if (!ac.hasResource(element)) {

                                node.warn("Resource " + element + " not found.");
                                missing.push(element);
                            }
                        });

                        //if there was a missing resource and force was NOT set, do not proceed with removal
                        if (missing.length > 0 && !node.force) {
                            throw new Error("Removal interrupted for missing resource(s).");

                        //if there was a missing resource and force was set, proceed with removal
                        } else if (missing.length > 0) {
                            resourceField = resourceField.filter((el) => !missing.includes(el));

                            if (resourceField.length > 0) {
                                ac.removeResources(resourceField);
                            } else {
                                throw new Error("Nothing to remove.");
                            }

                        //if all resources are present, proceed with removal
                        } else {
                            ac.removeResources(resourceField);
                        }

                        //check if the values have been removed
                        if (ac.hasResource(resourceField)) {
                            throw new Error("Resources were unexpectedly not removed.");
                        }

                    //IF it is NOT an array
                    } else {

                        //check if the value is present
                        if (!ac.hasResource(resourceField)) {
                            throw new Error("Resource not found.");
                        }

                        ac.removeResources(resourceField);

                        //check if the value has been removed
                        if (ac.hasResource(resourceField)) {
                            throw new Error("Resource was unexpectedly not removed.");
                        }
                    }

                    //LOG
                    node.log( logInfo('resource', resourceField) );

                }
                msg.accesscontrol = ac;

                send(msg);
                done();

            } catch (e) {
                node.error(e.message, msg);
                return null;
            }
        });


        function splitArray(value, type, msg){

            //characters not accepted
            const notAccepted = ['&','<','>','"',"'","/","`"];

            //get the actual value of role and resource if msg was selected
            if (type == "msg") {
                //filter removes empty fields
                var temp = RED.util.getMessageProperty(msg, value);
                if(Array.isArray(temp)){
                    return temp.filter(a=> a);
                }else{
                    return temp;
                }

            //get the actual value of role and resource if msg was NOT selected
            } else if (value) {

                notAccepted.forEach(element => {
                    if ((value).includes(element)){
                        throw new Error("Improper characters used. See the documentation.");
                    }
                });
                
                if ((value).includes(",")) {
                    //split by comma, map each value to an array field, filter out empty fields
                    return (value).split(",").map(item => item.trim()).filter(a=> a);
                } else {
                    return value;
                }

            //the current property (role or resource) is not selected
            } else {
                return null;
            }
        }

        function logInfo(field, name){
            if(Array.isArray(name)){
                return "Removed the " + field + "s named ["+ name +"].";
            } else {
                return "Removed the " + field + " named '"+ name +"'.";
            }
        }
    }
    RED.nodes.registerType("remove", RemoveNode);
}