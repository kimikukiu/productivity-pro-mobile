#!/bin/bash
# MiraintTool v.1.0
# Written by: Sinden
#NOTE* "chmod 777 setup.sh" "./setup.sh"

# Checks for UID 0
if [ "$(id -u)" != "0" ]; then
    echo "This script must be run as root" 1>&2
    exit 1
fi

# Update
read -r -p $'\e[93mShall we start by updating your box? (y/N)\e[0m: ' update
if [[ $update =~ ^([yY][eE][sS]|[yY])$ ]]; then
    apt-get update -y && apt-get upgrade -y && apt-get install build-essential -y
    clear
else
    printf "Script continuing...\\n"
    sleep 1
    clear
fi

# Install/Setup MySQL + Golang
read -r -p $'\e[93mWould you like to install/setup MySQL + Golang?.. (y/N)\e[0m: ' setup
if [[ $setup =~ ^([yY][eE][sS]|[yY])$ ]]; then
    apt-get install mysql-server mysql-client gcc curl electric-fence git -y
cd /tmp || wget https://storage.googleapis.com/golang/go1.7.4.linux-amd64.tar.gz
tar xvf go1.7.4.linux-amd64.tar.gz
rm -rf go1.7.4.linux-amd64.tar.gz
chown -R root:root ./go || mv go /usr/local
source ~/.bashrc
    clear
else
    printf "Script continuing...\\n"
    sleep 1
    clear
fi

# Download/Extract Cross Compiler Tool-Chains
CROSCMP="cross-compiler-armv5l cross-compiler-armv7l cross-compiler-mips cross-compiler-mipsel cross-compiler-sparc cross-compiler-powerpc cross-compiler-i586"
read -r -p $'\e[93mWould you like to install/uncompile all cross compiler tool-chains? (y/N)\e[0m: ' install
if [[ $install =~ ^([yY][eE][sS]|[yY])$ ]]; then
    if [ ! -L /etc/xcompile ]; then
        cd /etc/xcompile
    else
        mkdir /etc/xcompile >/dev/null
        cd /etc/xcompile
    fi
    
    for DWNLD in $CROSCMP; do
        if [ ! -d "$CROSCMP.tar.bz2" ]; then
            wget https://landley.net/aboriginal/downloads/old/binaries/1.2.6/$DWNLD.tar.bz2
            tar -xvf $DWNLD.tar.bz2
            rm -rf $DWNLD.tar.bz2
        else
            printf "$DWNLD.tar.bz2 is present\\n"
            sleep 1
        fi
    done
    
    if [ ! -d "$CROSCMP" ]; then
        echo "move cross-compiler-armv5l to armv5l ..."
        mv cross-compiler-armv5l armv5l
        echo "move cross-compiler-armv7l to armv7l ..."
        mv cross-compiler-armv7l armv7l
        echo "move cross-compiler-mips to mips ..."
        mv cross-compiler-mips mips
        echo "move cross-compiler-mipsel to mipsel ..."
        mv cross-compiler-mipsel mipsel
        echo "move cross-compiler-sparc to sparc ..."
        mv cross-compiler-sparc sparc
        echo "move cross-compiler-powerpc to powerpc ..."
        mv cross-compiler-powerpc powerpc
        echo "move cross-compiler-i586 to i586 ..."
        mv cross-compiler-i586 i586
        sleep 1
        clear
    else
        printf "Files already moved...\\n"
        sleep 1
    fi
else
    printf "Script continuing...\\n"
    sleep 1
    clear
fi

# Webserver & TFTP
read -r -p $'\e[93mWould you like to install webserver and tftp server? (y/N)\e[0m: ' webtftp
if [[ $webtftp =~ ^([yY][eE][sS]|[yY])$ ]]; then
    apt-get install nginx -y || service nginx restart
    apt-get install tftp tftpd-hpa -y
    cat > /etc/default/tftpd-hpa <<-TFTP
# /etc/default/tftpd-hpa
RUN_DAEMON="yes"
TFTP_OPTIONS="--secure --create --listen --verbose /srv/tftp"
TFTP_USERNAME="tftp"
TFTP_ADDRESS="0.0.0.0:69"
TFTP
    service tftp-hpa restart || clear
    printf "TFTP Server Succesfully Installed!\\n"
else
    printf "Script continuing...\\n"
    sleep 1
    clear
fi


# .bashrc
read -r -p $'\e[93mWould you like to update your .bashrc?.. (y/N)\e[0m: ' setup
if [[ $setup =~ ^([yY][eE][sS]|[yY])$ ]]; then
    curl https://hastebin.com/raw/ovoqinosen >~/.bashrc
    source ~/.bashrc
    clear
else
    printf "Script continuing...\\n"
    sleep 1
    clear
fi

# Install Golang MySQL & Shellwords
read -r -p $'\e[93mWould you like to install/setup MySQL + Shellwords Go Drivers?.. (y/N)\e[0m: ' goshell
if [[ $goshell =~ ^([yY][eE][sS]|[yY])$ ]]; then
    go get github.com/mattn/go-shellwords
    go get github.com/go-sql-driver/mysql
    clear
else
    printf "Script continuing...\\n"
    sleep 1
    clear
fi