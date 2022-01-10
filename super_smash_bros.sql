CREATE DATABASE IF NOT EXISTS `super_smash_bros`;
USE `super_smash_bros`;

CREATE TABLE IF NOT EXISTS `super_smash_bros`.`user`(
    `user_id` INT(7) PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(255),
    `password` VARCHAR(255),
    `is_deleted` TINYINT(1),
    `salt` VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS `super_smash_bros`.`admin`(
    `admin_id` INT(7) PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(255),
    `password` VARCHAR(255),
    `salt` VARCHAR(255),
    `is_deleted` TINYINT(1),
    `user_id` INT(7),
    FOREIGN KEY (`user_id`) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `super_smash_bros`.`characters`(
    `character_id` INT(7) PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255),
    `attributes` VARCHAR(255),
    `description` VARCHAR(255),
    `character_picture` LONGTEXT
);

CREATE TABLE IF NOT EXISTS `super_smash_bros`.`item`(
    `item_id` INT(7) PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255),
    `description` VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS `super_smash_bros`.`stages`(
    `stage_id` INT(7) PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255),
    `description` VARCHAR(255),
    `battle_environment` VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS `super_smash_bros`.`modes`(
    `modes_id` INT(7) PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255),
    `description` VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS `super_smash_bros`.`event_matches`(
    `event_id` INT(7) PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(255),
    `description` VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS `super_smash_bros`.`articles`(
    `article_id` INT(7) PRIMARY KEY AUTO_INCREMENT,
    `title` VARCHAR(60),
    `body` LONGTEXT,
    `description` VARCHAR(255),
    `date_created` datetime,
    `article_image` LONGTEXT,
    `user_id` INT(7),
    CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);