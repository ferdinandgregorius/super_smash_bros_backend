export class User{
    constructor(user_id, username, password, salt) {
        this.user_id = user_id
        this.username = username
        this.password = password
        this.salt = salt
    }
}