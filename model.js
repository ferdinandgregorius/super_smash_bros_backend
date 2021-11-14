export class User{
    constructor(user_id, username, password, salt) {
        this.user_id = user_id
        this.username = username
        this.password = password
        this.salt = salt
    }
}

export class Admin{
    constructor(admin_id, username, password, salt, user_id) {
        this.admin_id = admin_id
        this.username = username
        this.password = password
        this.salt = salt
        this.user_id = user_id
    }
}