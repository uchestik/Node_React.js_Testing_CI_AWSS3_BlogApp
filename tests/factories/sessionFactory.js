const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {
    const sessionObject = { //turn this session object into a string
        passport:{
            user : user._id.toString()
        }
    };
    const sessionString = Buffer.from(
        JSON.stringify(sessionObject))
        .toString('base64');    
    const sig = keygrip.sign('session=' + sessionString);
    
    return {
        session : sessionString,
        sig : sig
    };
}