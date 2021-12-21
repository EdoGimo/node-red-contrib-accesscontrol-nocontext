module.exports = function (RED) {
    function ACExportNode(config) {
        RED.nodes.createNode(this, config);

        //options
        this.mongo = config.mongo;
        this.mongoType = config.mongoType;

        //MAIN code
        var node = this;
        node.on('input', function (msg, send, done) {

            var mongoField;


            //get the actual value of _id if msg was selected
            if (node.mongoType == "msg") {
                mongoField = RED.util.getMessageProperty(msg, node.mongo);
            } else {
                mongoField = node.mongo;
            }

            try {
                const ac = msg.accesscontrol;

                if (!ac) {
                    throw new Error("AccessControl instance non-existent. Set it with 'AC init' first.");
                }

                //clear msg
                msg = {};

                //add mongoDB _id value, to override the object in mongoDB when using 'save'
                if (mongoField) {
                    msg._id = mongoField;
                }

                //add grants to payload (string)
                msg.payload = ac.getGrants();

                //payload is empty
                if(isEmpty(msg.payload)){
                    throw new Error("Empty istance, nothing to export.");
                } else {
                    //LOG
                    node.log("Instance exported.");
                }

                send(msg);
                done();

            } catch (e) {
                node.error(e.message, msg);
                return null;
            }
        });

        function isEmpty(object) {
            return Object.keys(object).length === 0;
        }
    }
    RED.nodes.registerType("AC export", ACExportNode);
}