module.exports = function (RED) {
    function DenyNode(config) {
        RED.nodes.createNode(this, config);

        //options
        this.who = config.who;
        this.whoType = config.whoType;

        //C
        this.createAny = config.createAny;
        this.createAnyType = config.createAnyType;
        this.createOwn = config.createOwn;
        this.createOwnType = config.createOwnType;
        //R
        this.readAny = config.readAny;
        this.readAnyType = config.readAnyType;
        this.readOwn = config.readOwn;
        this.readOwnType = config.readOwnType;
        //U
        this.updateAny = config.updateAny;
        this.updateAnyType = config.updateAnyType;
        this.updateOwn = config.updateOwn;
        this.updateOwnType = config.updateOwnType;
        //D
        this.deleteAny = config.deleteAny;
        this.deleteAnyType = config.deleteAnyType;
        this.deleteOwn = config.deleteOwn;
        this.deleteOwnType = config.deleteOwnType;

        this.what = config.what;
        this.whatType = config.whatType;

        //MAIN code
        var node = this;
        node.on('input', function (msg, send, done) {

            try {

                var whoField;
                var whatField;

                //get the actual value of WHO and WHAT if msg was selected
                if (node.whoType == "msg") {
                    whoField = RED.util.getMessageProperty(msg, node.who);
                } else {
                    whoField = node.who;
                }
                if (node.whatType == "msg") {
                    whatField = RED.util.getMessageProperty(msg, node.what);
                } else {
                    whatField = node.what;
                }

                //check if WHO or WHAT are specified
                if (!whoField || !whatField) {
                    throw new Error("WHO or WHAT fields not specified. Check the msg attributes are not empty!");
                }


                //get the actual value of CRUD attributes
                var createAnyField = getValue(node.createAnyType, node.createAny, msg);
                var createOwnField = getValue(node.createOwnType, node.createOwn, msg);
                var readAnyField = getValue(node.readAnyType, node.readAny, msg);
                var readOwnField = getValue(node.readOwnType, node.readOwn, msg);
                var updateAnyField = getValue(node.updateAny, node.updateAny, msg);
                var updateOwnField = getValue(node.updateOwn, node.updateOwn, msg);
                var deleteAnyField = getValue(node.deleteAny, node.deleteAny, msg);
                var deleteOwnField = getValue(node.deleteOwn, node.deleteOwn, msg);


                //check if there is an action selected
                if (!createAnyField && !createOwnField &&
                    !readAnyField && !readOwnField &&
                    !updateAnyField && !updateOwnField &&
                    !deleteAnyField && !deleteOwnField) {
                    throw new Error("Check at least one action or check that the msg attributes are not empty!");
                }


                //deny permissions
                const ac = msg.accesscontrol;

                if (!ac) {
                    throw new Error("AccessControl instance non-existent. Set it with 'AC init' first.");
                }

                if ((ac.getRoles()).includes(whoField) == false) {
                    throw new Error("The WHO role does not exist. Can't deny permissions to a non-existing role!");
                }

                if ((ac.getResources()).includes(whatField) == false) {
                    throw new Error("The WHAT role does not exist. Can't deny permissions to a non-existing resource!");
                }

                //IF both the Any and Own are selected, Any is enough

                //=== CREATE ===
                if (createAnyField) {
                    ac.deny(whoField).createAny(whatField);
                    //LOG
                    node.log( logInfo(whoField, "create ANY", whatField) );
                } else if (createOwnField) {
                    ac.deny(whoField).createOwn(whatField);
                    //LOG
                    node.log( logInfo(whoField, "create OWN", whatField) );
                }

                //=== READ ===
                if (readAnyField) {
                    ac.deny(whoField).readAny(whatField);
                    //LOG
                    node.log( logInfo(whoField, "read ANY", whatField) );
                } else if (readOwnField) {
                    ac.deny(whoField).readOwn(whatField);
                    //LOG
                    node.log( logInfo(whoField, "read OWN", whatField) );
                }

                //=== UPDATE ===

                if (updateAnyField) {
                    ac.deny(whoField).updateAny(whatField);
                    //LOG
                    node.log( logInfo(whoField, "update ANY", whatField) );
                } else if (updateOwnField) {
                    ac.deny(whoField).updateOwn(whatField);
                    //LOG
                    node.log( logInfo(whoField, "update OWN", whatField) );
                }

                //=== DELETE ===

                if (deleteAnyField) {
                    ac.deny(whoField).deleteAny(whatField);
                    //LOG
                    node.log( logInfo(whoField, "delete ANY", whatField) );
                } else if (deleteOwnField) {
                    ac.deny(whoField).deleteOwn(whatField);
                    //LOG
                    node.log( logInfo(whoField, "delete OWN", whatField) );
                }
                
                msg.accesscontrol = ac;

                send(msg);
                done();

            } catch (e) {
                node.error(e.message, msg);
                return null;
            }
        });


        function getValue(type, action, msg) {
            var result = false;

            //get the actual value of CRUD actions if is in msg + convert to boolean
            if (type == "msg") {
                result = RED.util.getMessageProperty(msg, action);
                if (typeof (result) == "string") {
                    result = result === 'true';
                }
            //import as a boolean from the node otherwise
            } else {
                result = action === 'true';
            }

            return result;
        }

        function logInfo(who, action, what){
            return "Denied to role '" + who + "' permission to '"+ action +"' on resource '" + what + "'.";
        }
    }
    RED.nodes.registerType("deny", DenyNode);
}