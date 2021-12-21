var should = require("should");
var helper = require("node-red-node-test-helper");

var requiredNodes = [
    require("../accesscontrol/ac_export.js"),
    require("../accesscontrol/ac_import.js"),
    require("../accesscontrol/ac_init.js"),
    require("../accesscontrol/ac_lock.js"),
    require("../accesscontrol/deny.js"),
    require("../accesscontrol/extend.js"),
    require("../accesscontrol/grant.js"),
    require("../accesscontrol/permission.js"),
    require("../accesscontrol/permissions.js"),
    require("../accesscontrol/remove.js")
];


describe('All nodes', function () {

    before(() => {
        helper.init(require.resolve('node-red'));
    });

    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function(done) {
        helper.unload().then(function () {
            helper.stopServer(done);
        });
    });


    //check correct loading
    it('should be loaded', function (done) {
        var flow = [
            { id: "n1", type: "AC export", name: "AC export" },
            { id: "n2", type: "AC import", name: "AC import" },
            { id: "n3", type: "AC init", name: "AC init" },
            { id: "n4", type: "AC lock", name: "AC lock" },
            { id: "n5", type: "deny", name: "deny" },
            { id: "n6", type: "extend", name: "extend" },
            { id: "n7", type: "grant", name: "grant" },
            { id: "n8", type: "permission", name: "permission" },
            { id: "n9", type: "permissions", name: "permissions" },
            { id: "n10", type: "remove", name: "remove" }
        ];

        helper.load(requiredNodes, flow, function () {

            var n1 = helper.getNode("n1");
            var n2 = helper.getNode("n2");
            var n3 = helper.getNode("n3");
            var n4 = helper.getNode("n4");
            var n5 = helper.getNode("n5");
            var n6 = helper.getNode("n6");
            var n7 = helper.getNode("n7");
            var n8 = helper.getNode("n8");
            var n9 = helper.getNode("n9");
            var n10 = helper.getNode("n10");

            try {
                //AC EXPORT
                n1.should.have.property('name', 'AC export');
                //AC IMPORT
                n2.should.have.property('name', 'AC import');
                //AC INIT
                n3.should.have.property('name', 'AC init');
                //AC LOCK
                n4.should.have.property('name', 'AC lock');
                //DENY
                n5.should.have.property('name', 'deny');
                //EXTEND
                n6.should.have.property('name', 'extend');
                //GRANT
                n7.should.have.property('name', 'grant');    
                //PERMISSION
                n8.should.have.property('name', 'permission');
                //PERMISSIONS
                n9.should.have.property('name', 'permissions');
                //REMOVE
                n10.should.have.property('name', 'remove');
                
                done();

            } catch (err) {
                done(err);
            }
        });
    });

});