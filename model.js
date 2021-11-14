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

export class Character{
    constructor(character_id, name, attributes, description, admin_id) {
        this.character_id = character_id
        this.name = name
        this.attributes = attributes
        this.description = description
        this.admin_id = admin_id
    }
}

export class Item{
    constructor(item_id, name, description, admin_id) {
        this.item_id = item_id
        this.name = name
        this.description = description
        this.admin_id = admin_id
    }
}

export class Stages{
    constructor(stage_id, name, description, battle_environment, admin_id) {
        this.stage_id = stage_id
        this.name = name
        this.description = description
        this.battle_environment = battle_environment
        this.admin_id = admin_id
    }
}

export class Modes{
    constructor(modes_id, name, description, admin_id) {
        this.mmodes_id = modes_id
        this.name = name
        this.description = description
        this.admin_id = admin_id
    }
}

export class Event_matches{
    constructor(event_id, name, description, admin_id) {
        this.event_id = event_id
        this.name = name
        this.description = description
        this.admin_id = admin_id
    }
}