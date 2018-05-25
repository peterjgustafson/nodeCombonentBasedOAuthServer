-- MySQL dump 10.13  Distrib 5.7.17, for macos10.12 (x86_64)
--
-- Host: valyant-gatekeeper.cwvc8q675znh.us-west-2.rds.amazonaws.com    Database: gatekeeper
-- ------------------------------------------------------
-- Server version	5.6.37-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `GetDefaultACLRoles`
--

DROP TABLE IF EXISTS `GetDefaultACLRoles`;
/*!50001 DROP VIEW IF EXISTS `GetDefaultACLRoles`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `GetDefaultACLRoles` AS SELECT 
 1 AS `user_id`,
 1 AS `component_id`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `access_tokens`
--

DROP TABLE IF EXISTS `access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `access_tokens` (
  `access_tokens_id` int(11) NOT NULL AUTO_INCREMENT,
  `access_token` varchar(60) NOT NULL,
  `user_id` varchar(45) NOT NULL,
  `access_token_timestamp` int(11) DEFAULT '0',
  `expires` int(11) DEFAULT '3600',
  PRIMARY KEY (`access_tokens_id`),
  UNIQUE KEY `idx_access_tokens_access_token` (`access_token`),
  KEY `idx_access_tokens_access_token_timestamp` (`access_token_timestamp`)
) ENGINE=InnoDB AUTO_INCREMENT=7987 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `acl`
--

DROP TABLE IF EXISTS `acl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `acl` (
  `user_id` varchar(45) NOT NULL,
  `component_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`component_id`),
  KEY `idx_acl_component_id` (`component_id`),
  CONSTRAINT `fk_user_acl` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `companies` (
  `company_id` int(11) NOT NULL AUTO_INCREMENT,
  `company_name` varchar(45) DEFAULT NULL,
  `company_key` varchar(45) DEFAULT NULL,
  `company_secret` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `components`
--

DROP TABLE IF EXISTS `components`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `components` (
  `component_id` int(11) NOT NULL AUTO_INCREMENT,
  `component_name` varchar(45) DEFAULT NULL,
  `component_short_name` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`component_id`),
  UNIQUE KEY `idx_components_component_short_name` (`component_short_name`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `getAccessTokenUserID`
--

DROP TABLE IF EXISTS `getAccessTokenUserID`;
/*!50001 DROP VIEW IF EXISTS `getAccessTokenUserID`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `getAccessTokenUserID` AS SELECT 
 1 AS `access_tokens_id`,
 1 AS `access_token`,
 1 AS `user_id`,
 1 AS `access_token_timestamp`,
 1 AS `expires`,
 1 AS `username`,
 1 AS `user_password`,
 1 AS `company_id`,
 1 AS `component_id`,
 1 AS `component_short_name`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `role_components`
--

DROP TABLE IF EXISTS `role_components`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role_components` (
  `role_id` int(11) NOT NULL,
  `component_id` int(11) NOT NULL,
  PRIMARY KEY (`role_id`,`component_id`),
  KEY `fk_component_id_idx` (`component_id`),
  CONSTRAINT `fk_component_id` FOREIGN KEY (`component_id`) REFERENCES `components` (`component_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL AUTO_INCREMENT,
  `role_name` varchar(45) DEFAULT NULL,
  `role_default_resources` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` varchar(45) NOT NULL,
  `username` varchar(45) NOT NULL,
  `user_password` varchar(45) NOT NULL,
  `company_id` int(11) DEFAULT '0',
  `role_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `idx_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'gatekeeper'
--

--
-- Dumping routines for database 'gatekeeper'
--
/*!50003 DROP PROCEDURE IF EXISTS `checkToken` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`gatekeeper`@`%` PROCEDURE `checkToken`(IN Token varchar(45), IN component varchar(10))
BEGIN
	
    DECLARE CheckExists int;
    SET CheckExists = 0;  
 
    SELECT count(*) INTO CheckExists FROM gatekeeper.getAccessTokenUserID WHERE access_token = Token AND component_short_name = component;   
 
    IF (CheckExists > 0) THEN
		UPDATE gatekeeper.access_tokens SET access_token_timestamp = UNIX_TIMESTAMP();
        SELECT * FROM gatekeeper.getAccessTokenUserID WHERE access_token = Token AND component_short_name = component;  
--   ELSE 
--       INSERT INTO lookup_table (someField ) VALUES(in_SomeParam);  
--       SELECT SomeId = LAST_INSERT_ID();  
    END IF; 
 
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `createUserAndRoles` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`gatekeeper`@`%` PROCEDURE `createUserAndRoles`(IN username VARCHAR(45), IN user_password VARCHAR(45), IN company_id INT(11), role_id INT(11))
BEGIN
INSERT INTO users (`user_id`, `username`, `user_password`, `company_id`, `role_id`) 
VALUES (username, username, SHA(user_password), company_id, role_id);
INSERT into acl
SELECT 
        username AS `user_id`,
        `role_components`.`component_id` AS `component_id`
    FROM
        (`roles`
        JOIN `role_components`)
    WHERE
        (`roles`.`role_id` = `role_components`.`role_id`
        AND `role_components`.`role_id` = role_id);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `GetDefaultACLRoles`
--

/*!50001 DROP VIEW IF EXISTS `GetDefaultACLRoles`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`gatekeeper`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `GetDefaultACLRoles` AS select `users`.`user_id` AS `user_id`,`role_components`.`component_id` AS `component_id` from (`users` join `role_components`) where (`users`.`role_id` = `role_components`.`role_id`) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `getAccessTokenUserID`
--

/*!50001 DROP VIEW IF EXISTS `getAccessTokenUserID`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`gatekeeper`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `getAccessTokenUserID` AS select `access_tokens`.`access_tokens_id` AS `access_tokens_id`,`access_tokens`.`access_token` AS `access_token`,`access_tokens`.`user_id` AS `user_id`,`access_tokens`.`access_token_timestamp` AS `access_token_timestamp`,`access_tokens`.`expires` AS `expires`,`users`.`username` AS `username`,`users`.`user_password` AS `user_password`,`companies`.`company_id` AS `company_id`,`acl`.`component_id` AS `component_id`,`components`.`component_short_name` AS `component_short_name` from ((((`access_tokens` join `users`) join `companies`) join `acl`) join `components`) where ((`access_tokens`.`user_id` = `users`.`user_id`) and (`users`.`company_id` = `companies`.`company_id`) and (`acl`.`user_id` = `users`.`user_id`) and (`components`.`component_id` = `acl`.`component_id`) and (unix_timestamp() < (`access_tokens`.`access_token_timestamp` + `access_tokens`.`expires`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-05-24 21:51:03
