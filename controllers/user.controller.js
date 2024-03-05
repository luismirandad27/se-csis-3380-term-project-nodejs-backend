/**
 * user.controller.js
 * Javascript file that includes the main actions for users.
 *
 *
 * @version 1.0
 * @author  Luis Miguel Miranda
 * @updated 2024-02-02
 *
*/

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};