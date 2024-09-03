import { useCallback, useRef } from "react"

import { FilterState } from "../components/context/PickerContext";
import { baseCategoriesConfig } from "../config/categoryConfig";
import { DataEmoji, EmojiProperties } from "../dataUtils/DataTypes";
import { alphaNumericEmojiIndex } from "../dataUtils/alphaNumericEmojiIndex";
import { emojisByCategory } from "../dataUtils/emojiSelectors";

import { filterEmojiObjectByKeyword, findLongestMatch, isEmojiFilteredBySearchTerm } from "./useFilter";

export const useEmojiSearch = (limit = 5) => {
    const categories = baseCategoriesConfig();
    const filterRef = useRef<FilterState>(alphaNumericEmojiIndex);

    return useCallback((searchTerm: string) => {
        const longestMatch = findLongestMatch(searchTerm, filterRef.current);

        if (longestMatch) {
            Object.assign(filterRef.current, {
                [searchTerm]: filterEmojiObjectByKeyword(longestMatch, searchTerm)
            })
        }

       return Object.values(categories).reduce((emojisArray, category) => {
            const categoryEmojis = emojisByCategory(category.category).reduce((emojiAcc, emoji) => {
                const filteredOut = isEmojiFilteredBySearchTerm(emoji[EmojiProperties.unified], filterRef.current, searchTerm);
                if (!filteredOut) {
                    emojiAcc.push(emoji);
                }

                if(emojiAcc.length >= limit) {
                    return emojiAcc;
                }

                return emojiAcc;
          }, [] as DataEmoji[]);

          if(emojisArray.length >= limit) {
                return emojisArray;
           }


          return [...emojisArray, ...categoryEmojis];
       }, [] as DataEmoji[]);
    },[categories, limit]);
}
