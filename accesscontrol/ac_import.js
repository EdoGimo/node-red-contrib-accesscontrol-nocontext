module.exports = function (RED) {
    function ACImportNode(config) {
        RED.nodes.createNode(this, config);

        //options
        this.mongo = config.mongo;
        this.mongoType = config.mongoType;

        //MAIN code
        var node = this;
        node.on('input', function (msg, send, done) {

            var db = msg.payload;
            var mongoField;


            //get the actual value of _id if msg was selected
            if (node.mongoType == "msg") {
                mongoField = RED.util.getMessageProperty(msg, node.mongo);
            } else {
                mongoField = node.mongo;
            }

            //catch AccessControlError
            try {

                if (!msg.payload) {
                    throw new Error("AccessControl instance non-existent. Set it with 'AC init' first.");
                }

                const ac = msg.accesscontrol;

                if (mongoField) {
                    var index = db.findIndex(x => x._id === mongoField);

                    if (index == -1) {
                        throw new Error("Cannot find the specified MongoDB '_id' in the JSON.");
                    }

                    delete db[index]._id;
                    db = db[index];
                }

                //read grants from payload (string)
                ac.setGrants(db);

                if(isEmpty(ac.getGrants())){
                    throw new Error("Nothing was imported. Check the input payload.");
                }else{
                    node.warn("Permissions successfully imported.");
                }
                
                msg.accesscontrol = ac;

                send(msg);
                done();

            } catch (e) {
                if (e instanceof TypeError) {
                    node.error("Missing payload or value not an AccessControl compatible JSON.");
                    return null;
                } else {
                    node.error(e.message, msg);
                    return null;
                }
            }
        });

        function isEmpty(object) {
            return Object.keys(object).length === 0;
        }
    }
    RED.nodes.registerType("AC import", ACImportNode);
}