// PRIMARY AUTHOR: Richard Lu

var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    group: { type: mongoose.Schema.ObjectId, required: true, ref: 'Group' },
    description: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    posted: { type: Date, default: Date.now },
    locationGeneral: { type: String, required: true },
    locationDescription: { type: String, required: true},
    tags: [
        { type: String }
    ],
    attendees: [
        {
            userId: { type: mongoose.Schema.ObjectId, required: true },
            username: { type: String, require: true },
            visible: { type: Boolean, default: true }
        }
    ],
    imageURL: String
});

module.exports = mongoose.model('Event', eventSchema);
