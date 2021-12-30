module.exports = function (RED) {
    function Permissions2Node(config) {
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
                    throw new Error("WHO or WHAT fields not specified. Check the msg attributes are not empty!");
                }


                var createAnyField = getValue(node.createAnyType, node.createAny, msg);
                var createOwnField = getValue(node.createOwnType, node.createOwn, msg);
                var createAttrField = getAttrValue(node.createType, node.create, msg);

                var readAnyField = getValue(node.readAnyType, node.readAny, msg);
                var readOwnField = getValue(node.readOwnType, node.readOwn, msg);
                var readAttrField = getAttrValue(node.readType, node.read, msg);

                var updateAnyField = getValue(node.updateAnyType, node.updateAny, msg);
                var updateOwnField = getValue(node.updateOwnType, node.updateOwn, msg);
                var updateAttrField = getAttrValue(node.updateType, node.update, msg);

                var deleteAnyField = getValue(node.deleteAnyType, node.deleteAny, msg);
                var deleteOwnField = getValue(node.deleteOwnType, node.deleteOwn, msg);
                var deleteAttrField = getAttrValue(node.deleteType, node.delete, msg);


                //check if there is an action selected
                if (!createAnyField && !createOwnField &&
                    !readAnyField && !readOwnField &&
                    !updateAnyField && !updateOwnField &&
                    !deleteAnyField && !deleteOwnField) {
                    throw new Error("No CRUD action specified. Check at least one (or that msg attributes are not all empty)!");
                }


                const ac = msg.accesscontrol;

                if (!ac) {
                    throw new Error("AccessControl instance non-existent. Set it with 'AC init' first.");
                }


                var permissions = null;
                var proceed = true;


                //check if role and resource exist
                if ((ac.getRoles()).includes(whoField) == false) {
                    throw new Error("The WHO role does not exist. Create it with the grant node before.");
                }

                if ((ac.getResources()).includes(whatField) == false) {
                    throw new Error("The WHAT role does not exist. Create it with the grant node before.");
                }


                //control if permissions are correct for ANY
                if (createAnyField == true) {
                    permissions = ac.can(whoField).createAny(whatField);

                    proceed = proceedCheck(permissions, createAttrField);

                //control if permissions are correct for OWN
                } else if (createOwnField == true) {
                    permissions = ac.can(whoField).createOwn(whatField);

                    proceed = proceedCheck(permissions, createAttrField)
                }

                if (proceed == true && readAnyField == true) {
                    permissions = ac.can(whoField).readAny(whatField);

                    proceed = proceedCheck(permissions, readAttrField);

                } else if (proceed == true && readOwnField == true) {
                    permissions = ac.can(whoField).readOwn(whatField);

                    proceed = proceedCheck(permissions, readAttrField);
                }

                if (proceed == true && updateAnyField == true) {
                    permissions = ac.can(whoField).updateAny(whatField);

                    proceed = proceedCheck(permissions, updateAttrField);

                } else if (proceed == true && updateOwnField == true) {
                    permissions = ac.can(whoField).updateOwn(whatField);

                    proceed = proceedCheck(permissions, updateAttrField);
                }

                if (proceed == true && deleteAnyField == true) {
                    permissions = ac.can(whoField).deleteAny(whatField);

                    proceed = proceedCheck(permissions, deleteAttrField);

                } else if (proceed == true && deleteOwnField == true) {
                    permissions = ac.can(whoField).deleteOwn(whatField);

                    proceed = proceedCheck(permissions, deleteAttrField);
                }

                //output
                msg.payload = proceed;


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


        function proceedCheck(permissions, attrField) {
            //check if target is contained in arr
            let checker = (arr, target) => target.every(v => arr.includes(v));

            //if permission is false, avoid all the following IFs
            if (permissions.granted == false) {
                return false;

            //if permission is true and attributes are specified, run additional checks
            } else if (attrField) {
                var attr = permissions.attributes;

                //if both are arrays (attr is always returned as such)
                if (Array.isArray(attrField)) {
                    return checker(attr, attrField);

                    //if they are not arrays
                } else {
                    node.warn("An 'attribute' value passed via msg is not an array!");
                    return false;
                }

            //if permission is true and attributes are NOT specified, go on
            } else {
                return true;
            }
        }
    }

    RED.nodes.registerType("ACn permissions", Permissions2Node);
}