module.exports = function (RED) {
    function ACLockNode(config) {
        RED.nodes.createNode(this, config);

        //MAIN code
        var node = this;

        node.on('input', function (msg, send, done) { //send not needed


            try {
                const ac = msg.accesscontrol;

                if (!ac) {
                    throw new Error("AccessControl instance non-existent. Set it with 'AC init' first.");
                }

                if (ac.isLocked) {
                    throw new Error("The instance is already locked.");
                }

                ac.lock();

                if (!ac.isLocked) {
                    throw new Error("An error occured while locking the instance.");
                } else {
                    node.warn("Instance locked.");
                }
                msg.accesscontrol = ac;

                send(msg);
                done();

            } catch (e) {
                node.error(e.message, msg);
                return null;
            }


        });
    }
    RED.nodes.registerType("AC lock", ACLockNode);
}