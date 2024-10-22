'use strict';

const auth = require("../middleware/auth")


module.exports = function (app) {
    const Api = require('../controllers/userController');

    app.route('/api/register')
        .post(Api.register_a_user);

    app.route('/api/login')
        .post(Api.login_a_user);

    app.route('/api/users')
        .get(Api.get_all_users);

    app.route('/api/addTask')
        .post(Api.addTask);

    app.route('/api/getAllTask')
        .get(Api.getAllTask);

    app.route('/api/deleteTask/:id')
        .delete(Api.DeleteTask);

    app.route('/api/updateTask/:id')
        .put(Api.UpdateTask);

};