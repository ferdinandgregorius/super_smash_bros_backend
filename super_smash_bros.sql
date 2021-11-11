CREATE DATABASE IF NOT EXISTS `super_smash_bros`;
USE `super_smash_bros`;

CREATE TABLE IF NOT EXISTS `super_smash_bros`.`user`(
    `user_id` INT(7) PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(255),
    `password` VARCHAR(255),
    `salt` VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS `super_smash_bros`.`admin`(
    `admin_id` INT(7) PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(255),
    `password` VARCHAR(255),
    `salt` VARCHAR(255),
    `user_id` INT(7),
    FOREIGN KEY (`user_id`) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

