import { toJSONPath } from "@/Utils/toJSONPath"

describe('toJSONPath', () => {
  it('processes an empty object', () => {
    const r = toJSONPath({})
 
    expect(r).toEqual(new Map())
  })
  it('processes simple values', () => {
    const r1 = toJSONPath('Sevro Barca')
    expect(r1).toEqual(new Map([['.', 'Sevro Barca']]))

    const r2 = toJSONPath('Victra Julii')
    expect(r2).toEqual(new Map([['.', 'Victra Julii']]))

    const r3 = toJSONPath(2187)
    expect(r3).toEqual(new Map([['.', 2187]]))
  })
  it('processes top level arrays', () => {
    const r1 = toJSONPath([1,2,3])
    expect(r1).toEqual(new Map([
        ['.[0]', 1],
        ['.[1]', 2],
        ['.[2]', 3],
    ]))
  })
  it('processes 1 level string keys with simple values', () => {
    const r1 = toJSONPath({'Darrow': 'Lykos'})
    expect(r1).toEqual(new Map([['.Darrow', 'Lykos']]))

    const LykosSymbol = Symbol('Lykos')
    const r2 = toJSONPath({'Eo': LykosSymbol})
    expect(r2).toEqual(new Map([['.Eo', LykosSymbol]]))

    const r3 = toJSONPath({'Deanna O\'Lykos': true})
    expect(r3).toEqual(new Map([
        ['.Deanna O\'Lykos', true],
    ]))
  })
  it('processes 2 level string keys with simple values', () => {
    const r1 = toJSONPath({
        'Arcos': {
            'Lorn': 'Death begets Death begets Death',
            'Alexander': 'Pup One',
        }
    })
    expect(r1).toEqual(new Map([
        ['.Arcos.Lorn', 'Death begets Death begets Death'],
        ['.Arcos.Alexander', 'Pup One'],
    ]))
  })
  it('handles a deeper complex set of keys and organized structured data', () => {
    const r1 = toJSONPath({
        Notifications: {
            Auditing: {
                enabled: true,
                duration: 'P3M',
            },
            Reports: [
                { // I highly doubt I would store this in a DB this way, but for testing toJSONPath...
                    reportName: 'addedItems',
                    period: 'Monthly', // not sure how this will be represented in actual settings, but in this test it doesn't matter yet
                    threshhold: '1', // maybe don't send the report if no items added in period? not trying to create new ideas with these tests... I just do...
                },
                {
                    reportName: 'valueByLeafNode', //leaf node may not be the correct designation, but some marker between room-level locations and furniture/box-level locations
                    period: 'Quarterly',
                    // this report type has no qualifiers maybe so it doesn't have additional configuration?
                }
            ]
        },

    })
    expect(r1.size).toBe(7)
    expect([...r1.keys()]).toContain('.Notifications.Reports[1].reportName')
    expect(r1.get('.Notifications.Reports[0].period')).toEqual('Monthly')
  })
})