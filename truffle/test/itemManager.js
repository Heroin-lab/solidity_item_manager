const ItemManager = artifacts.require("ItemManager")

contract("ItemManager", accounts => {
    it("... should be able create an item", async () => {
        const itemManagerInstance = await ItemManager.deployed()

        const mockName = "Tester"
        const mockPrice = 700

        var value = await itemManagerInstance.createItem(mockName, mockPrice, { from: accounts[0] })

        assert.equal(value.logs[0].args._itemIdentifier.words[0], 0, "0 must be the first index after creating contract")

        const item  = await itemManagerInstance.items(0)

        assert.equal(item.price.words[0], mockPrice, "Price don`t match to the mock value")
        assert.equal(item.identifier, mockName, "Item name don`t match to the mock value")
    })
})