import getProximity from './index';

const testData = [
    {'params':[[0, 229, 356, 483, 576, 805, 898, 1059], 8, 240], 'res':{'proximityIndex':0, 'activeCategory':0, 'inViewPort':{'1':true}}},
    {'params':[[0, 1079, 1546, 2353, 2718, 3593, 4196, 5513], 4, 240], 'res':{'proximityIndex':0, 'activeCategory':0, 'inViewPort':{}}},
    {'params':[[0, 229, 356, 483, 576, 805, 898, 1059], 187, 240], 'res':{'proximityIndex':null, 'activeCategory':0, 'inViewPort':{'1':true, '2':true}}},
    {'params':[[0, 229, 356, 483, 576, 805, 898, 1059], 254, 240], 'res':{'proximityIndex':1, 'activeCategory':1, 'inViewPort':{'2':true, '3':true}}},
    {'params':[[0, 1079, 1546, 2353, 2718, 3593, 4196, 5513], 1513, 240], 'res':{'proximityIndex':null, 'activeCategory':1, 'inViewPort':{'2':true}}},
    {'params':[[0, 229, 356, 483, 576, 805, 898, 1059], 446, 240], 'res':{'proximityIndex':null, 'activeCategory':2, 'inViewPort':{'3':true, '4':true}}},
    {'params':[[0, 127, 0, 186, 245, 0, 304, 363], 0, 240], 'res':{'proximityIndex':5, 'activeCategory':5, 'inViewPort':{'0':true, '1':true, '2':true, '3':true, '5':true}}},
    {'params':[[0, 1079, 1546, 2353, 2718, 3593, 4196, 5513], 4987, 240], 'res':{'proximityIndex':null, 'activeCategory':6, 'inViewPort':{}}},
    {'params':[[0, 0, 0, 0, 59, 118, 0, 0], 0, 240], 'res':{'proximityIndex':7, 'activeCategory':7, 'inViewPort':{'0':true, '1':true, '2':true, '3':true, '4':true, '5':true, '6':true, '7':true}}},
    {'params':[null, 0, 0], 'res':{'proximityIndex':0, 'activeCategory':0, 'inViewPort':{'0': true}}},
    {'params':[null, undefined, NaN], 'res':{'proximityIndex':0, 'activeCategory':0, 'inViewPort':{}}}
];

describe('Test getProximity Function', () => {

    it('Should produce a correct proximity object based on given information', () => {
        testData.forEach((item) => expect(getProximity(...item.params)).to.deep.equal(item.res));
    });
});