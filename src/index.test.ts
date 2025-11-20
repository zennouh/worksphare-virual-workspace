
import { roleEnum, roomEnum } from "./utility/enum";
import { stringValidate, checkRoomeAndRole } from "./utility/helpers";
// const {stringValidate} = require("./utility/helpers.ts")
// import { inputFields } from "./utility/mytypes";



describe("helper function", () => {

    test("validation name", () => {
        const testValues = {
            name: "nouh zennane",
            value: "name"
        };
        const isValid = stringValidate(testValues.name, "name");
        expect(isValid).toBe(true)
    })
    test("validation name", () => {

        const isValid = stringValidate("nouh", "name");
        expect(isValid).toBe(true)
    })
    test("validation email", () => {

        const isValid = stringValidate("nouh@gmail.com", "email");
        expect(isValid).toBe(true)
    })
    test("validation phone", () => {

        const isValid = stringValidate("064534187654", "phone");
        expect(isValid).toBe(true)
    })
    test("validation image", () => {

        const isValid = stringValidate("https://img.jpg", "image");
        expect(isValid).toBe(true)
    })

    test("check roleand room", () => {
        expect(checkRoomeAndRole(roleEnum.it, roomEnum.server)).toBe(true);
        expect(checkRoomeAndRole(roleEnum.it, roomEnum.reception)).toBe(false);
    });
    test("check roleand room part 2", () => {
        
        expect(checkRoomeAndRole(roleEnum.it, roomEnum.reception)).toBe(false);
    });

})