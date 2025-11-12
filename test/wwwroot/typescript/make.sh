#/bin/bash

clear

if [ -z "$1" ]; then
    arg="all"
else
    arg=$1
fi

echo "make $arg"
found=0

if [ "$arg" = "boot" ] || [ "$arg" = "all" ]; then
    tsc --p bootconfig.json
    if [ $? -eq 0 ]; then
        echo "boot.ts compiled OK"
    else
        echo "boot.ts failed to compile"
        exit 1
    fi
    found=1
fi

if [ "$arg" = "app" ] || [ "$arg" = "all" ]; then
    tsc --p appconfig.json
    if [ $? -eq 0 ]; then
        echo "app.ts compiled OK"
    else
        echo "app.ts failed to compile"
        exit 1
    fi
    found=1
fi

if [ "$arg" = "test" ] || [ "$arg" = "all" ]; then
    tsc --p testconfig.json
    if [ $? -eq 0 ]; then
        echo "test.ts compiled OK"
    else
        echo "test.ts failed to compile"
        exit 1
    fi
    found=1
fi

if [ "$arg" = "strip" ] || [ "$arg" = "all" ]; then
    tsc --p stripconfig.json
    if [ $? -eq 0 ]; then
        echo "strip.ts compiled OK"
    else
        echo "strip.ts failed to compile"
        exit 1
    fi
    found=1
fi

if [ "$arg" = "hardware" ] || [ "$arg" = "all" ]; then
    tsc --p hardwareconfig.json
    if [ $? -eq 0 ]; then
        echo "hardware.ts compiled OK"
    else
        echo "hardware.ts failed to compile"
        exit 1
    fi
    found=1
fi

if [ $found -eq 0 ];  then
    echo "make target \"$arg\" not found"
    exit 1
fi

exit 0