module.exports = function (RED) {
    function ACInitNode(config) {
        RED.nodes.createNode(this, config);
        
        var node = this;

        node.on('input', function (msg, send, done) {

            try {

                const AccessControl = require('accesscontrol');
                const ac = new AccessControl();
                
                msg.accesscontrol = ac;

                send(msg);
                done();

            } catch (e) {
                node.error(e.message, msg);
                return null;
            }
        });
    }
    RED.nodes.registerType("AC init", ACInitNode);
}