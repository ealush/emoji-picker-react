import { useCallback, useRef } from "react"

import { FilterState } from "../components/context/PickerContext";
import { GetEmojiUrl } from "../components/emoji/BaseEmojiProps";
import { baseCategoriesConfig } from "../config/categoryConfig";
import { EmojiProperties } from "../dataUtils/DataTypes";
import { alphaNumericEmojiIndex } from "../dataUtils/alphaNumericEmojiIndex";
import { emojisByCategory, emojiUrlByUnified } from "../dataUtils/emojiSelectors";
import { EmojiClickData, EmojiStyle, SkinTones } from "../types/exposedTypes";

import { filterEmojiObjectByKeyword, findLongestMatch, isEmojiFilteredBySearchTerm } from "./useFilter";
import { emojiClickOutput } from "./useMouseDownHandlers";


const categoryArray = Object.values(baseCategoriesConfig());

export const useEmojiSearch = ({ activeSkinTone = SkinTones.NEUTRAL, activeEmojiStyle= EmojiStyle.NATIVE, getEmojiUrl = emojiUrlByUnified }: {activeSkinTone?: SkinTones, activeEmojiStyle?: EmojiStyle,limit?:number, getEmojiUrl?: GetEmojiUrl}) => {
    const filterRef = useRef<FilterState>(alphaNumericEmojiIndex);

    return useCallback((searchTerm: string) => {
        const longestMatch = findLongestMatch(searchTerm, filterRef.current);

        if (longestMatch) {
            Object.assign(filterRef.current, {
                [searchTerm]: filterEmojiObjectByKeyword(longestMatch, searchTerm)
            })
        }

       return categoryArray.reduce((emojisArray, category) => {
            const categoryEmojis = emojisByCategory(category.category).reduce((emojiAcc, emoji) => {
                const filteredOut = isEmojiFilteredBySearchTerm(emoji[EmojiProperties.unified], filterRef.current, searchTerm);
                if (!filteredOut) {
                    emojiAcc.push(emojiClickOutput(emoji,activeSkinTone,activeEmojiStyle,getEmojiUrl));
                }
                return emojiAcc;
          }, [] as EmojiClickData[]);

          return [...emojisArray, ...categoryEmojis];
       }, [] as EmojiClickData[]);
    },[activeEmojiStyle, activeSkinTone, getEmojiUrl]);
}
