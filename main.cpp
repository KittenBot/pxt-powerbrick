#include <stdlib.h>
#include "pxt.h"

using namespace std;

namespace powerbrick {

    //%
    uint32_t dht11Update(uint8_t dht) {
        uint32_t value;
        uint8_t counter;
        int loopCnt = 100;
        uBit.io.pin[dht].setDigitalValue(0);
        uBit.sleep(18);
        uBit.io.pin[dht].getDigitalValue();
        uBit.io.pin[dht].setPull(PullUp);

        while (uBit.io.pin[dht].getDigitalValue() == 1) {
            loopCnt--;
            if (loopCnt == 0) {
                return 0;
            }
        };
        loopCnt = 9999;
        while (uBit.io.pin[dht].getDigitalValue() == 0){
            if (loopCnt-- == 0) return 0;
        }
        while (uBit.io.pin[dht].getDigitalValue() == 1){
            if (loopCnt-- == 0) return 0;
        }
        value = 0;
        for (int i = 0; i <= 32 - 1; i++) {
            while (uBit.io.pin[dht].getDigitalValue() == 0){
                if (loopCnt-- == 0) return -1;
            }
            counter = 0;
            while (uBit.io.pin[dht].getDigitalValue() == 1){
                counter++;
                if (loopCnt-- == 0) return -1;
            }
            if (counter >= 8) {
                value = value + (1 << (31 - i));
            }
        }
        return value;
    }
    
    
    
} // namespace powerbrick