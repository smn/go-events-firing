var vumigo = require("vumigo_v01");
var jed = require("jed");

if (typeof api === "undefined") {
    // testing hook (supplies api when it is not passed in by the real sandbox)
    var api = this.api = new vumigo.dummy_api.DummyApi();
}

var EndState = vumigo.states.EndState;
var InteractionMachine = vumigo.state_machine.InteractionMachine;
var StateCreator = vumigo.state_machine.StateCreator;

function ExampleApp() {
    var self = this;
    // The first state to enter
    StateCreator.call(self, 'done');

    self.add_creator('done', function(state_name, im) {
        var p = im.api_request('kv.incr', {
            key: 'user-counter',
            amount: 1
        });
        p.add_callback(function(result) {
            return new EndState(
                'done',
                'You are visitor number ' + result.value,
                'done',
                {
                    on_enter: function() {
                        // returns a Promise
                        return im.api_request('metrics.fire', {
                            store: 'app-metrics',
                            metric: 'number-of-users',
                            value: result.value,
                            /*
                            NOTE:

                            Your options here are sum, avg, min or max.
                            These determine how the metrics are aggregated
                            before being sent to the backend.

                            In this case we're always only interested in the
                            highest value this metric ever was and discard
                            anything else.
                            */
                            agg: 'max'
                        });
                    }
                });
        });
        return p;
    });
}

// launch app
var states = new ExampleApp();
var im = new InteractionMachine(api, states);
im.attach();
