module.exports = function (RED) {
    function PermissionNode(config) {
        RED.nodes.createNode(this, config);

        //options
        this.who = config.who;
        this.whoType = config.whoType;
        this.crud = config.crud;
        this.any = config.any;
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

                if (!whoField || !whatField || !node.crud) {
                    throw new Error("WHO or WHAT fields not specified. Check the msg attributes are not empty!");
                }

                const ac = msg.accesscontrol;

                if (!ac) {
                    throw new Error("AccessControl instance non-existent. Set it with 'AC init' first.");
                }

                var permission = null;

                switch (node.crud) {
                    //CREATE
                    case "create":
                        if (node.any) {
                            permission = ac.can(whoField).createAny(whatField);
                        } else {
                            permission = ac.can(whoField).createOwn(whatField);
                        }
                        break;

                    //READ
                    case "read":
                        if (node.any) {
                            permission = ac.can(whoField).readAny(whatField);
                        } else {
                            permission = ac.can(whoField).readOwn(whatField);
                        }
                        break;

                    //UPDATE
                    case "update":
                        if (node.any) {
                            permission = ac.can(whoField).updateAny(whatField);
                        } else {
                            permission = ac.can(whoField).updateOwn(whatField);
                        }
                        break;

                    //DELETE
                    case "delete":
                        if (node.any) {
                            permission = ac.can(whoField).deleteAny(whatField);
                        } else {
                            permission = ac.can(whoField).deleteOwn(whatField);
                        }
                        break;

                    default:
                        throw new Error("An error has occurred when selecting the CRUD value!");
                }

                //output
                msg.payload = permission.granted;

                if(permission.granted){
                    msg.attributes = permission.attributes;
                }


                send(msg);
                done();

            } catch (e) {
                node.error(e.message, msg);
                return null;
            }
        });
    }
    RED.nodes.registerType("permission", PermissionNode);
}