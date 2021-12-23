module.exports = function (RED) {
    function GrantNode(config) {
        RED.nodes.createNode(this, config);

        //options
        this.who = config.who;
        this.whoType = config.whoType;
        this.what = config.what;
        this.whatType = config.whatType;

        //C
        this.createAny = config.createAny;
        this.createAnyType = config.createAnyType;
        this.createOwn = config.createOwn;
        this.createOwnType = config.createOwnType;
        this.create = config.create;
        this.createType = config.createType;
        //R
        this.readAny = config.readAny;
        this.readAnyType = config.readAnyType;
        this.readOwn = config.readOwn;
        this.readOwnType = config.readOwnType;
        this.read = config.read;
        this.readType = config.readType;
        //U
        this.updateAny = config.updateAny;
        this.updateAnyType = config.updateAnyType;
        this.updateOwn = config.updateOwn;
        this.updateOwnType = config.updateOwnType;
        this.update = config.update;
        this.updateType = config.updateType;
        //D
        this.deleteAny = config.deleteAny;
        this.deleteAnyType = config.deleteAnyType;
        this.deleteOwn = config.deleteOwn;
        this.deleteOwnType = config.deleteOwnType;
        this.delete = config.delete;
        this.deleteType = config.deleteType;

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
                    throw new Error("WHO or WHAT fields not specified. Ensure the msg attributes are not empty!");
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


                //variables initialized only if the array is in the msg
                var createField = getAttrValue(node.createType, node.create, msg);
                var readField = getAttrValue(node.readType, node.read, msg);
                var updateField = getAttrValue(node.updateType, node.update, msg);
                var deleteField = getAttrValue(node.deleteType, node.delete, msg);


                //grant permissions
                const ac = msg.accesscontrol;

                if (!ac) {
                    throw new Error("AccessControl instance non-existent. Set it with 'AC init' first.");
                }


                //IF both the Any and Own are selected, Any is enough

                //=== CREATE ===
                if (createAnyField == true) {
                    ac.grant(whoField).createAny(whatField, createField);
                    //LOG
                    node.log( logInfo(whoField, "create ANY", whatField, createField) );
                } else if (createOwnField == true) {
                    ac.grant(whoField).createOwn(whatField, createField);
                    //LOG
                    node.log( logInfo(whoField, "create OWN", whatField, createField) );
                }

                //=== READ ===
                if (readAnyField == true) {
                    ac.grant(whoField).readAny(whatField, readField);
                    //LOG
                    node.log( logInfo(whoField, "read ANY", whatField, readField) );
                } else if (readOwnField == true) {
                    ac.grant(whoField).readOwn(whatField, readField);
                    //LOG
                    node.log( logInfo(whoField, "read OWN", whatField, readField) );
                }

                //=== UPDATE ===
                if (updateAnyField == true) {
                    ac.grant(whoField).updateAny(whatField, updateField);
                    //LOG
                    node.log( logInfo(whoField, "update ANY", whatField, updateField) );
                } else if (updateOwnField == true) {
                    ac.grant(whoField).updateOwn(whatField, updateField);
                    //LOG
                    node.log( logInfo(whoField, "update OWN", whatField, updateField) );
                }

                //=== DELETE ===
                if (deleteAnyField == true) {
                    ac.grant(whoField).deleteAny(whatField, deleteField);
                    //LOG
                    node.log( logInfo(whoField, "delete ANY", whatField, deleteField) );
                } else if (deleteOwnField == true) {
                    ac.grant(whoField).deleteOwn(whatField, deleteField);
                    //LOG
                    node.log( logInfo(whoField, "delete OWN", whatField, deleteField) );
                }

                msg.accesscontrol = ac;

                send(msg);
                done();

            } catch (e) {
                node.error(e.message, msg);
                return null;
            }
        });


        function getAttrValue(type, attr, msg){
            var result = null;

            //CRUD attributes for msg
            if (type == "msg") {

                result = RED.util.getMessageProperty(msg, attr);
                if(Array.isArray(result)){
                    result = result.filter(a=> a);
                } else if (typeof result === 'string' || result instanceof String){
                    result = notAccepted(result);
                } else {
                    throw new Error("Unsupported type of msg value in attributes field. See the documentation.");
                }

            //if attributes exist but are not saved in msg (string)
            } else if(attr){

                result = notAccepted(attr);
            }

            return result;
        }

        function notAccepted(attr){
            const notAccepted = ['&','<','>','"',"'","/","`", ":", "[", "]", ";"];

            notAccepted.forEach(element => {
                if ((attr).includes(element)){
                    throw new Error("Improper characters used in the attributes field. See the documentation.");
                }
            });

            if ((attr).includes(",")) {
                //split by comma, map each attr to an array field, filter out empty fields
                return (attr).split(",").map(item => item.trim()).filter(a=> a);
            } else {
                return attr;
            }
        }


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
        

        function logInfo(who, action, what, attr){
            if(attr){
                return "Granted to role '" + who + "' permission to '"+ action +"' on resource '" + what + "' with attributes [" + attr + "].";
            } else {
                return "Granted to role '" + who + "' permission to '"+ action +"' on resource '" + what + "' without attributes.";
            }
        }
    }
    RED.nodes.registerType("grant", GrantNode);
}