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
    constructor(character_id, name, attributes, description, character_picture) {
        this.character_id = character_id
        this.name = name
        this.attributes = attributes
        this.description = description
        this.character_picture = character_picture
    }
}

export class Item{
    constructor(item_id, name, description) {
        this.item_id = item_id
        this.name = name
        this.description = description
    }
}

export class Stages{
    constructor(stage_id, name, description, battle_environment) {
        this.stage_id = stage_id
        this.name = name
        this.description = description
        this.battle_environment = battle_environment
    }
}

export class Modes{
    constructor(modes_id, name, description) {
        this.mmodes_id = modes_id
        this.name = name
        this.description = description
    }
}

export class Event_matches{
    constructor(event_id, name, description) {
        this.event_id = event_id
        this.name = name
        this.description = description
    }
}

export class Articles{
    constructor(article_id, title, body, description, article_image, date_created, user_id) {
        this.article_id = article_id
        this.title = title
        this.body = body
        this.description = description
        this.date_created = date_created
        this.article_image = article_image
        this.user_id = user_id
    }
}