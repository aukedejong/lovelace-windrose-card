import {describe, expect, test} from "@jest/globals";
import {GlobalConfig} from "./GlobalConfig";
import {Log} from "../util/Log";

describe('GlobalConfig', () => {

    describe('defaultLogLevel', () => {

        test('is a string value, not undefined', () => {
            expect(GlobalConfig.defaultLogLevel).toBeDefined();
        });

        test('is NONE', () => {
            expect(GlobalConfig.defaultLogLevel).toBe('NONE');
        });

        test('is accepted by Log.checkLogLevel without throwing', () => {
            expect(() => Log.checkLogLevel(GlobalConfig.defaultLogLevel)).not.toThrow();
        });

        test('Log.checkLogLevel does not fall back to WARN for the default level', () => {
            // Previously defaultLogLevel was declared as a type annotation (`: 'NONE'`)
            // instead of a value assignment (`= 'NONE'`), making it undefined at runtime.
            // checkLogLevel(undefined) returns 'WARN', causing all warn-level messages to
            // be logged by default when they should be suppressed.
            expect(Log.checkLogLevel(GlobalConfig.defaultLogLevel)).toBe('NONE');
        });

    });

});
