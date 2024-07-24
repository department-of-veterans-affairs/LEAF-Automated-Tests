<?php

require_once getenv('APP_LIBS_PATH') . '/globals.php';
require_once getenv('APP_LIBS_PATH') . '/../Leaf/Db.php';

$log_file = fopen("update_ah_usermetadata_log.txt", "w") or die("unable to open file");
$time_start = date_create();

$db = new App\Leaf\Db(DIRECTORY_HOST, DIRECTORY_USER, DIRECTORY_PASS, 'national_leaf_launchpad');

//get records of each portal and assoc orgchart
$q = "SELECT `portal_database`, `orgchart_database` FROM `sites`
    WHERE `portal_database` IS NOT NULL AND `site_type`='portal'";

$portal_records = $db->query($q);

$pcount = count($portal_records);
$updated_count = 0;
$no_entries_count = 0;
$error_count = 0;

foreach($portal_records as $rec) {
    $portal_db = $rec['portal_database'];
    $orgchart_db = $rec['orgchart_database'];
    $portal_time_start = date_create();

    try {
        //************ PORTAL (first use) ************ */
        $db->query("USE `{$portal_db}`");

        //get distinct userIDs from portal's action_history table
        try {
            $usersQ = "SELECT DISTINCT `userID` FROM `action_history`";

            $resUniqueIDs = $db->query($usersQ) ?? [];
            $numIDs = count($resUniqueIDs);

            if($numIDs > 0) {
                fwrite(
                    $log_file,
                    "\r\nUnique action history userID count for " . $portal_db . ": " . $numIDs . "\r\n-----------------------\r\n"
                );

                try {
                    //switch to orgchart and get needed info for these IDs
                    //************ ORGCHART ************ */
                    $db->query("USE `{$orgchart_db}`");

                    $inUsersArr = array_column($resUniqueIDs, 'userID');
                    $inUserID_Set = implode(',', $inUsersArr);

                    $v = array(':inUserID_Set' => $inUserID_Set);

                    $qEmployee = "SELECT `employee`.`empUID`, `userName`, `lastName`, `firstName`, `middleName`, `deleted`, `data` AS `email` FROM `employee`
                        JOIN `employee_data` ON `employee`.`empUID`=`employee_data`.`empUID`
                        WHERE `indicatorID`=6 AND FIND_IN_SET(`employee`.`userName`, :inUserID_Set)";

                    try {
                        $resEmployeeInfo = $db->prepared_query($qEmployee, $v) ?? [];

                        //************ switch to PORTAL to update metadata ************ */
                        $db->query("USE `{$portal_db}`");

                        //build CASE statement for org_emp indicators
                        $sqlUpdateMetadata = "UPDATE `action_history`
                            SET `userMetadata` = CASE `userID` ";

                        $metaVars = array();
                        foreach ($resEmployeeInfo as $idx => $emp) {
                            $isActive = $emp['deleted'] === 0;
                            $metadata = json_encode(
                                array(
                                    'userName' => $isActive ? $emp['userName'] : '',
                                    'firstName' => $isActive ? $emp['firstName'] : '',
                                    'lastName' => $isActive ? $emp['lastName'] : '',
                                    'middleName' => $isActive ? $emp['middleName'] : '',
                                    'email' => $isActive ? $emp['email'] : ''
                                )
                            );
                            $metaVars[":user_" . $idx] = $emp['userName'];
                            $metaVars[":meta_" . $idx] = $metadata;
                            $sqlUpdateMetadata .= " WHEN :user_" . $idx . " THEN :meta_" . $idx;
                        }

                        $sqlUpdateMetadata .= " END";
                        //NOTE: needed if batching.
                        //$sqlUpdateMetadata .= " WHERE `userMetadata` IS NULL";

                        try {
                            $db->prepared_query($sqlUpdateMetadata, $metaVars);
                            $updated_count += 1;

                            $portal_time_end = date_create();
                            $portal_time_diff = date_diff($portal_time_start, $portal_time_end);

                            fwrite(
                                $log_file,
                                "Portal update took: " . $portal_time_diff->format('%H hr, %i min, %S sec, %f mcr') . "\r\n"
                            );


                        } catch (Exception $e) {
                            fwrite(
                                $log_file,
                                "Caught Exception (update action_history usermetadata case): " . $e->getMessage() . "\r\n"
                            );
                        }

                    } catch (Exception $e) {
                        fwrite(
                            $log_file,
                            "Caught Exception (query employee join employee_data): " . $e->getMessage() . "\r\n"
                        );
                        $error_count += 1;
                    }

                } catch (Exception $e) {
                    fwrite(
                        $log_file,
                        "Caught Exception (orgchart connect): " . $e->getMessage() . "\r\n"
                    );
                    $error_count += 1;
                }

            } else {
                $no_entries_count += 1;
            }

        } catch (Exception $e) {
            fwrite(
                $log_file,
                "Caught Exception (query distinct ah userIDs): " . $e->getMessage() . "\r\n"
            );
            $error_count += 1;
        }

    } catch (Exception $e) {
        fwrite(
            $log_file,
            "Caught Exception (portal connect): " . $e->getMessage() . "\r\n"
        );
        $error_count += 1;
    }
}

$time_end = date_create();
$time_diff = date_diff($time_start, $time_end);

fwrite(
    $log_file,
    "\r\n-----------------------\r\nProcess took: " . $time_diff->format('%H hr, %i min, %S sec, %f mcr') . "\r\n"
);

fclose($log_file);