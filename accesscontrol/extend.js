module.exports = function (RED) {
    function ExtendNode(config) {
        RED.nodes.createNode(this, config);

        //options
        this.who = config.who;  //Beneficiary
        this.whoType = config.whoType;
        this.what = config.what;    //Inherit from
        this.whatType = config.whatType;

        //MAIN code
        var node = this;
        node.on('input', function (msg, send, done) {

            try {

                //get the actual value of WHO and WHAT
                var whoField = splitArray(node.who, node.whoType, msg);
                var whatField = splitArray(node.what, node.whatType, msg);


                //check if configuration was set
                if (!whoField || !whatField) {
                    throw new Error("WHO or WHAT fields not specified. Check the msg attributes are not empty!");
                }

                const ac = msg.accesscontrol;

                if (!ac) {
                    throw new Error("AccessControl instance non-existent. Set it with 'AC init' first.");
                }

                //extend role (preconditions delegated to the module)
                ac.grant(whoField).extend(whatField);


                //postconditions
                //if WHO is an array
                if(Array.isArray(whoField)){
                    //run the function for each element
                    whoField.forEach(element => {
                        isInherited(whatField, ac.getInheritedRolesOf(element));

                        //LOG
                        node.log( logInfo(element, whatField) );
                    });

                //if WHO is NOT an array
                } else {
                    isInherited(whatField, ac.getInheritedRolesOf(whoField));

                    //LOG
                    node.log( logInfo(whoField, whatField) );
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
            var result = null;

            //get the actual value if msg was selected
            if (type == "msg") {

                result = RED.util.getMessageProperty(msg, value);
                if(Array.isArray(result)){
                    result = result.filter(a=> a);  //filter removes empty fields
                } else if (typeof result === 'string' || result instanceof String){
                    result = notAccepted(result);
                } else {
                    throw new Error("Unsupported type of msg value. See the documentation.");
                }

            //if not saved in msg (string)
            } else {

                result = notAccepted(value);
            }

            return result;
        }


        function notAccepted(value){
            const notAccepted = ['&','<','>','"',"'","/","`", ":", "[", "]", ";"];

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
        }


        //checks if inheritance was successful
        function isInherited(whatField, inherit){

            //check if target is contained in arr
            let checker = (arr, target) => target.every(v => arr.includes(v));

            //if WHAT is an array
            if(Array.isArray(whatField)){

                //be sure the arrey is contained in the inherit array (inherited roles of WHO)
                if (!checker(whatField, inherit)){
                    throw new Error("Roles unexpectedly not inherited.");
                }
            //if WHAT is NOT an array
            } else {

                //be sure the string is contained in the inherit array
                if (inherit.indexOf(whatField) === -1){
                    throw new Error("Role unexpectedly not inherited.");
                }
            }
        }

        function logInfo(who, what){
            if(Array.isArray(what)){
                return "Extended role '" + who + "', inheriting from roles [" + what + "].";
            } else {
                return "Extended role '" + who + "', inheriting from role '" + what + "'.";
            }
        }
    }
    RED.nodes.registerType("extend", ExtendNode);
}