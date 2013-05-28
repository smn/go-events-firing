var fs = require("fs");
var assert = require("assert");
var vumigo = require("vumigo_v01");
var app = require("../lib/go-events-firing");

// This just checks that you hooked you InteractionMachine
// up to the api correctly and called im.attach();
describe("test api", function() {
    it("should exist", function() {
        assert.ok(app.api);
    });
    it("should have an on_inbound_message method", function() {
        assert.ok(app.api.on_inbound_message);
    });
    it("should have an on_inbound_event method", function() {
        assert.ok(app.api.on_inbound_event);
    });
});

describe("Event firing key value store application", function() {

    var tester = new vumigo.test_utils.ImTester(app.api, {
        async: true
    });

    it('should increment the key and end the session', function(done) {
        var p = tester.check_state({
            user: null,
            content: null,
            next_state: 'done',  // it's only 1 state that we return to,
            response: 'You are visitor number 1',
            continue_session: false
        });
        p.then(done, done);
    });

    it('should fire an event on session completion', function(done) {
        var p = tester.check_state({
            user: null,
            content: null,
            next_state: 'done',  // it's only 1 state that we return to,
            response: 'You are visitor number 1',
            continue_session: false
        }).then(function() {
            var metrics_store = app.api.metrics['app-metrics'];
            var metric = metrics_store['number-of-users'];
            assert.equal(metric.agg, 'max');
            assert.deepEqual(metric.values, [1]);
        }).then(done, done);
    });
});