#!/bin/sh
# ###########################################################################
# Script generated by Fortify SCA Scan Wizard (c) 2011-2018 Micro Focus or one of its affiliates
# Created on 2018/07/12 13:24:49
# ###########################################################################
# Generated for the following languages:
# 	HTML
# 	Javascript
# 	PHP
# 	SQL
# ###########################################################################
# DEBUG - if set to true, runs SCA in debug mode
# SOURCEANALYZER - the name of the SCA executable
# FPR - the name of analysis result file
# BUILDID - the SCA build id
# ARGFILE - the name of the argument file that's extracted and passed to SCA
# BYTECODE_ARGFILE - the name of the argument file for Java Bytecode translation that's extracted and passed to SCA
# MEMORY - the memory settings for SCA
# LAUNCHERSWITCHES - the launcher settings that are used to invoke SCA
# OLDFILENUMBER - this defines the file which contains the number of files within the project, it is automatically generated
# FILENOMAXDIFF - this is the percentage of difference between the number of files which will trigger a warning by the script
# ###########################################################################

DEBUG=false
SOURCEANALYZER=sourceanalyzer
FPR="Fortify-${JOB_NAME}+b${BUILD_NUMBER}#${SHORT_COMMIT_HASH}.fpr"
BUILDID="leaf"
ARGFILE="Fortify-${JOB_NAME}+b${BUILD_NUMBER}#${SHORT_COMMIT_HASH}.sh.args"
BYTECODE_ARGFILE="Fortify-${JOB_NAME}+b${BUILD_NUMBER}#${SHORT_COMMIT_HASH}.sh.bytecode.args"
MEMORY="-Xmx5g -Xms400M -Xss24M "

LAUNCHERSWITCHES=""
OLDFILENUMBER=Fortify-${JOB_NAME}+b${BUILD_NUMBER}#${SHORT_COMMIT_HASH}.sh.fileno
FILENOMAXDIFF=10
ENABLE_BYTECODE=false

PROJECTROOT0="$WORKSPACE/$TEMP_FORTIFY_DIR"
if [ ! -d "$PROJECTROOT0" ]; then
   echo  "ERROR: This script is being run on a different machine than it was"
   echo  "       generated on or the targeted project has been moved. This script is "
   echo  "       configured to locate files at"
   echo  "          $PROJECTROOT0"
   echo  "       Please modify the \$PROJECTROOT0 variable found"
   echo  "       at the top of this script to point to the corresponding directory"
   echo  "       located on this machine."
   exit
fi

if [ $DEBUG = true ]; then export LAUNCHERSWITCHES="-debug $LAUNCHERSWITCHES"; fi
echo Extracting Arguments File


grep "# ARGS" $0 | grep -v grep | cut -d" " -f3- | sed -e s#PROJECTROOT0_MARKER#"$PROJECTROOT0"#g   > $ARGFILE

grep "# BYTECODE_ARGS" $0 | grep -v grep | cut -d" " -f3- | sed -e s#PROJECTROOT0_MARKER#"$PROJECTROOT0"#g   > $BYTECODE_ARGFILE

if [ -s $BYTECODE_ARGFILE ]; then
ENABLE_BYTECODE=true
fi
# ###########################################################################
echo Cleaning previous scan artifacts
$SOURCEANALYZER $MEMORY $LAUNCHERSWITCHES -logfile Fortify-translate-${JOB_NAME}+b${BUILD_NUMBER}#${SHORT_COMMIT_HASH}.log -b $BUILDID -clean
if [ $? = 1 ] ; then
echo Sourceanalzyer failed cleaning previous scan artifacts, exiting
exit
fi
# ###########################################################################
echo Translating files
command="$SOURCEANALYZER $MEMORY $LAUNCHERSWITCHES -logfile Fortify-translate-${JOB_NAME}+b${BUILD_NUMBER}#${SHORT_COMMIT_HASH}.log -b $BUILDID @$ARGFILE"
echo $command > Fortify-translate-cmd-${JOB_NAME}+b${BUILD_NUMBER}#${SHORT_COMMIT_HASH}.txt
eval $command
if [ $? = 1 ] ; then
echo Sourceanalzyer failed, exiting
exit
fi
# ###########################################################################
if [ $ENABLE_BYTECODE = true ]; then
echo Translating Java bytecode files
$SOURCEANALYZER $MEMORY $LAUNCHERSWITCHES -b $BUILDID @$BYTECODE_ARGFILE
if [ $? = 1 ] ; then
echo Sourceanalzyer failed translating java bytecode files, exiting
exit
fi
fi
# ###########################################################################
echo Testing Difference between Translations
FILENUMBER=`$SOURCEANALYZER -b $BUILDID -show-files | wc -l`

if [ ! -f $OLDFILENUMBER ]; then
	echo It appears to be the first time running this script, setting $OLDFILENUMBER to $FILENUMBER
	echo $FILENUMBER > $OLDFILENUMBER
else
	OLDFILENO=`cat $OLDFILENUMBER`
	DIFF=`expr $OLDFILENO "*" $FILENOMAXDIFF`
	DIFF=`expr $DIFF /  100`

	MAX=`expr $OLDFILENO + $DIFF`
	MIN=`expr $OLDFILENO - $DIFF`

	if [ $FILENUMBER -lt $MIN ] ; then SHOWWARNING=true; fi
	if [ $FILENUMBER -gt $MAX ] ; then SHOWWARNING=true; fi

	if [ -n "$SHOWWARNING" ] && [ "$SHOWWARNING" = true ] ; then
		echo "WARNING: The number of files has changed by over $FILENOMAXDIFF%, it is recommended"
		echo "         that this script is regenerated with the ScanWizard"
	fi

	echo $MAX $MIN $DIFF
fi;

# ###########################################################################
echo Starting scan
$SOURCEANALYZER $MEMORY $LAUNCHERSWITCHES -b $BUILDID -scan -f $FPR -mt
if [ $? = 1 ] ; then
echo Sourceanalzyer failed starting scan, exiting
exit
fi
# ###########################################################################
command="ReportGenerator -format pdf -f Fortify_Scan_Results-${JOB_NAME}+b${BUILD_NUMBER}#${SHORT_COMMIT_HASH}.pdf -source $FPR -template DeveloperWorkbook.xml -showSuppressed -showHidden"
echo $command
eval $command

echo Fortify Scan and PDF Generation Finished
# ARGS "-Dcom.fortify.sca.fileextensions.sql=PLSQL"
# ARGS "-exclude" "PROJECTROOT0_MARKER/docs/standards/php-cs-config.php"
# ARGS "-exclude" "PROJECTROOT0_MARKER/build_automation/**/*"
# ARGS "-exclude" "PROJECTROOT0_MARKER/docker-leaf/mysql/leaf_users_test_data.sql"
# ARGS "-exclude" "PROJECTROOT0_MARKER/docker-leaf/mysql/leaf_portal_test_data.sql"
# ARGS "-exclude" "PROJECTROOT0_MARKER/docker/mysql/resource_database_boilerplate.sql"
# ARGS "-exclude" "PROJECTROOT0_MARKER/docker/mysql/orgchart_boilerplate_empty.sql"
# ARGS "PROJECTROOT0_MARKER"