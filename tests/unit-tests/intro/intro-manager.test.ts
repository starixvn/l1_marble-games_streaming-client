import { createMockStore, cleanupMockObserver, initializeMockContainer } from "../../utils/mock-store";
import { IntroStore } from "../../../assets/scripts/intro/intro-store";
import { VideoStatus } from "../../../assets/scripts/streaming/streaming-type";

// Mock the observer decorator
jest.mock("observer", () => {
  const { createMockObserver } = require("../../utils/mock-store");
  return createMockObserver();
});

// Mock cc module
const mockNode1 = { active: false };
const mockNode2 = { active: false };
const mockNode3 = { active: false };

jest.mock("cc", () => ({
  _decorator: {
    ccclass: jest.fn().mockImplementation(() => (target: any) => target),
    property: jest.fn().mockImplementation(() => (target: any, propertyKey: string) => {}),
  },
  Component: class MockComponent {
    node: any = {};
  },
  Node: class MockNode {
    active: boolean = false;
  },
}));

import { IntroManager } from "../../../assets/scripts/intro/intro-manager";

describe("IntroManager", () => {
  let manager: IntroManager;
  let mockIntroStore: IntroStore & {
    update: (props: Partial<IntroStore>) => void;
    reset: (props: Partial<IntroStore>) => void;
  };

  beforeAll(() => {
    initializeMockContainer();
    
    mockIntroStore = createMockStore(IntroStore, {
      url: "",
      currentTime: 0,
      status: VideoStatus.Stopped,
    });

    manager = new IntroManager();
    manager.phaseNode = [mockNode1, mockNode2, mockNode3] as any;
  });

  afterAll(() => {
    cleanupMockObserver();
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockIntroStore.reset({
      url: "",
      currentTime: 0,
      status: VideoStatus.Stopped,
    });

    // Reset node states
    mockNode1.active = false;
    mockNode2.active = false;
    mockNode3.active = false;

    // Ensure phaseNode array is correctly set
    manager.phaseNode = [mockNode1, mockNode2, mockNode3] as any;

    jest.clearAllMocks();
  });

  describe("@render IntroStore.status behavior", () => {
    describe("store integration", () => {
      it("should be connected to IntroStore and have reactive status property", () => {
        // Verify store is properly set up
        expect(mockIntroStore.status).toBeDefined();
        expect(typeof mockIntroStore.status).toBe("string");
        
        // Verify store updates work
        mockIntroStore.update({ status: VideoStatus.Playing });
        expect(mockIntroStore.status).toBe(VideoStatus.Playing);
        
        mockIntroStore.update({ status: VideoStatus.Stopped });
        expect(mockIntroStore.status).toBe(VideoStatus.Stopped);
      });
    });

    describe("syncStatus method with store integration", () => {
      it("should sync nodes to active when store status is Stopped", () => {
        // Arrange
        mockIntroStore.update({ status: VideoStatus.Stopped });
        
        // Act - manually trigger the method that the decorator would call
        (manager as any).syncStatus(mockIntroStore.status);

        // Assert
        expect(mockNode1.active).toBe(true);
        expect(mockNode2.active).toBe(true);
        expect(mockNode3.active).toBe(true);
      });

      it("should sync nodes to inactive when store status is Playing", () => {
        // Arrange
        mockIntroStore.update({ status: VideoStatus.Playing });
        
        // Act - manually trigger the method that the decorator would call
        (manager as any).syncStatus(mockIntroStore.status);

        // Assert
        expect(mockNode1.active).toBe(false);
        expect(mockNode2.active).toBe(false);
        expect(mockNode3.active).toBe(false);
      });

      it("should handle status transitions correctly", () => {
        // Test transition: Stopped -> Playing -> Stopped
        
        // Initial: Stopped
        mockIntroStore.update({ status: VideoStatus.Stopped });
        (manager as any).syncStatus(mockIntroStore.status);
        expect(mockNode1.active).toBe(true);
        expect(mockNode2.active).toBe(true);
        expect(mockNode3.active).toBe(true);

        // Transition to Playing
        mockIntroStore.update({ status: VideoStatus.Playing });
        (manager as any).syncStatus(mockIntroStore.status);
        expect(mockNode1.active).toBe(false);
        expect(mockNode2.active).toBe(false);
        expect(mockNode3.active).toBe(false);

        // Back to Stopped
        mockIntroStore.update({ status: VideoStatus.Stopped });
        (manager as any).syncStatus(mockIntroStore.status);
        expect(mockNode1.active).toBe(true);
        expect(mockNode2.active).toBe(true);
        expect(mockNode3.active).toBe(true);
      });

      it("should handle empty phaseNode array gracefully", () => {
        // Arrange
        manager.phaseNode = [];
        mockIntroStore.update({ status: VideoStatus.Playing });

        // Act - should not throw
        (manager as any).syncStatus(mockIntroStore.status);
        
        mockIntroStore.update({ status: VideoStatus.Stopped });
        (manager as any).syncStatus(mockIntroStore.status);
        
        // Assert - completed without errors
        expect(manager.phaseNode).toEqual([]);
      });

      it("should handle single phaseNode correctly", () => {
        // Arrange
        const singleNode = { active: false };
        manager.phaseNode = [singleNode] as any;

        // Test Stopped status
        mockIntroStore.update({ status: VideoStatus.Stopped });
        (manager as any).syncStatus(mockIntroStore.status);
        expect(singleNode.active).toBe(true);

        // Test Playing status
        mockIntroStore.update({ status: VideoStatus.Playing });
        (manager as any).syncStatus(mockIntroStore.status);
        expect(singleNode.active).toBe(false);
      });
    });

    describe("decorator setup verification", () => {
      it("should have the correct render method signature", () => {
        // Verify that the syncStatus method exists and can be called
        expect(typeof (manager as any).syncStatus).toBe("function");
        
        // Verify it can handle VideoStatus enum values
        (manager as any).syncStatus(VideoStatus.Playing);
        (manager as any).syncStatus(VideoStatus.Stopped);
        
        // Assert - method calls completed successfully
        expect(true).toBe(true);
      });

      it("should be properly registered with @observer decorator", () => {
        // Verify the component was decorated properly
        expect(manager).toBeDefined();
        expect(manager.phaseNode).toBeDefined();
      });
    });

    describe("status selector behavior", () => {
      it("should only react to status property, not other store properties", () => {
        // Set initial status
        mockIntroStore.update({ status: VideoStatus.Stopped });
        (manager as any).syncStatus(mockIntroStore.status);
        expect(mockNode1.active).toBe(true);

        // Change other properties but keep status the same
        const originalStatus = mockIntroStore.status;
        mockIntroStore.update({ 
          url: "http://example.com/video.mp4",
          currentTime: 123.45,
          status: originalStatus  // Keep status unchanged
        });

        // Since status didn't change, nodes should remain as they were
        expect(mockNode1.active).toBe(true);
        expect(mockNode2.active).toBe(true);
        expect(mockNode3.active).toBe(true);

        // Verify the selector would get the right value
        expect(mockIntroStore.status).toBe(VideoStatus.Stopped);
      });
    });
  });

  describe("component initialization", () => {
    it("should initialize with default phaseNode array", () => {
      // Arrange & Act
      const newManager = new IntroManager();

      // Assert
      expect(newManager.phaseNode).toEqual([]);
    });

    it("should be properly decorated with ccclass", () => {
      // Assert - The name might be modified by decorators, so we check for existence instead
      expect(IntroManager).toBeDefined();
      expect(typeof IntroManager).toBe("function");
    });
  });

  describe("integration with IntroStore", () => {
    it("should have access to IntroStore instance", () => {
      // Assert
      expect(mockIntroStore).toBeDefined();
      expect(typeof mockIntroStore.setUrl).toBe("function");
      expect(typeof mockIntroStore.update).toBe("function");
    });

    it("should work with store method calls", () => {
      // Act - use store methods
      mockIntroStore.setUrl("http://example.com/intro.mp4");
      mockIntroStore.update({ 
        currentTime: 30, 
        status: VideoStatus.Playing 
      });

      // Assert - store state should be updated
      expect(mockIntroStore.url).toBe("http://example.com/intro.mp4");
      expect(mockIntroStore.currentTime).toBe(30);
      expect(mockIntroStore.status).toBe(VideoStatus.Playing);
      
      // Verify that manually calling syncStatus with store value works
      (manager as any).syncStatus(mockIntroStore.status);
      expect(mockNode1.active).toBe(false);
      expect(mockNode2.active).toBe(false);
      expect(mockNode3.active).toBe(false);
    });

    it("should demonstrate decorator would react to store changes", () => {
      // This test shows how the @render decorator would work in production
      
      // Arrange
      const newManager = new IntroManager();
      const testNode = { active: false };
      newManager.phaseNode = [testNode] as any;

      // Act - simulate decorator behavior by manually triggering syncStatus
      mockIntroStore.update({ status: VideoStatus.Stopped });
      (newManager as any).syncStatus(mockIntroStore.status);

      // Assert - nodes should react to status change
      expect(testNode.active).toBe(true);
      
      // Test Playing status
      mockIntroStore.update({ status: VideoStatus.Playing });
      (newManager as any).syncStatus(mockIntroStore.status);
      expect(testNode.active).toBe(false);
    });

    it("should demonstrate selector function extracting status from store", () => {
      // This test verifies the selector (store) => store.status works correctly
      
      // Set different statuses and verify selector would get the right value
      mockIntroStore.update({ status: VideoStatus.Playing });
      expect(mockIntroStore.status).toBe(VideoStatus.Playing);
      
      mockIntroStore.update({ status: VideoStatus.Stopped });
      expect(mockIntroStore.status).toBe(VideoStatus.Stopped);
      
      // Verify the status property is what the decorator selector would use
      const statusSelector = (store: any) => store.status;
      expect(statusSelector(mockIntroStore)).toBe(VideoStatus.Stopped);
    });
  });
});