/* tslint:disable */
 
/**
 * Story Generator
 * The story generator API description
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */



/**
 * 
 * @export
 * @interface UpdateTypeDto
 */
export interface UpdateTypeDto {
    /**
     * 
     * @type {number}
     * @memberof UpdateTypeDto
     */
    'id'?: number;
    /**
     * Type of the story
     * @type {string}
     * @memberof UpdateTypeDto
     */
    'name'?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateTypeDto
     */
    'story_prompt'?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateTypeDto
     */
    'chapter_prompt'?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateTypeDto
     */
    'image_prompt'?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateTypeDto
     */
    'sound_prompt'?: string;
}

