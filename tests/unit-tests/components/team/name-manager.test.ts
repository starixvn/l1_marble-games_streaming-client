import { Label } from "cc";
import { Name } from "../../../../assets/scripts/components/team/name";
import { NameManager } from "../../../../assets/scripts/components/team/name-manager";
import { Team } from "../../../../assets/scripts/components/team/team";

jest.mock("db://i18n/LanguageData", () => ({
  t: (key: string) => (key.startsWith("common.") ? "" : key),
}));

class MockLocalizedLabel {
  _key = "";
  set key(v: string) {
    this._key = v;
  }
  get key() {
    return this._key;
  }
  updateLabel = jest.fn();
}

describe("NameManager", () => {
  let comp: NameManager;

  beforeEach(() => {
    // Arrange
    comp = new NameManager();
  });

  describe("syncOperator", () => {
    it("stores operator", () => {
      // Arrange
      // Act
      (comp as any)["syncOperator"]("op");

      // Assert
      expect((comp as any).operator).toBe("op");
    });
  });

  describe("syncTeamName", () => {
    it("sets name based on HOME team", () => {
      // Arrange
      comp.team = Team.HOME;
      const spy = jest.spyOn(comp as any, "name", "set");
      const data: any = { homeTeamName: "op_home", awayTeamName: "op_away" };

      // Act
      comp.syncTeamName(data);

      // Assert
      expect(spy).toHaveBeenCalledWith("op_home");
    });
  });

  describe("onLoad", () => {
    it("collects labels from targets", () => {
      // Arrange
      const n1 = (comp as any).node;
      const name1 = n1.addComponent(Name);
      name1.short = false;
      n1.addComponent(MockLocalizedLabel as any);
      const n2 = (comp as any).node;
      const name2 = n2.addComponent(Name);
      name2.short = true;
      n2.addComponent(Label as any);
      (comp as any).targets = [name1, name2];

      // Act
      (comp as any).onLoad();

      // Assert
      expect(((comp as any).longLabels as any[]).length).toBe(1);
      expect(((comp as any).shortLabels as any[]).length).toBe(1);
    });
  });

  describe("name setter", () => {
    it("sets LocalizedLabel key and updates label", () => {
      // Arrange
      (comp as any).operator = "Operator";
      (comp as any).longLabels = [new MockLocalizedLabel()];
      (comp as any).shortLabels = [new Label()];

      // Act
      (comp as any).name = "op_team";

      // Assert
      expect((comp as any).longLabels[0]._key).toBe("Operator.op_team");
      expect((comp as any).shortLabels[0].string).toBe("TEAM");
    });
  });
});
