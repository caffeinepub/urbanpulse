import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  module Category {
    public type Type = {
      #StreetLight;
      #Trash;
      #RoadDamage;
      #Water;
      #Other;
    };

    func compare(category1 : Type, category2 : Type) : Order.Order {
      switch (category1, category2) {
        case (#StreetLight, #StreetLight) { #equal };
        case (#StreetLight, _) { #less };
        case (_, #StreetLight) { #greater };

        case (#Trash, #Trash) { #equal };
        case (#Trash, _) { #less };
        case (_, #Trash) { #greater };

        case (#RoadDamage, #RoadDamage) { #equal };
        case (#RoadDamage, _) { #less };
        case (_, #RoadDamage) { #greater };

        case (#Water, #Water) { #equal };
        case (#Water, _) { #less };
        case (_, #Water) { #greater };

        case (#Other, #Other) { #equal };
      };
    };
  };
  module Status {
    public type Type = {
      #Open;
      #InProgress;
      #Resolved;
    };
    public func compare(s1 : Type, s2 : Type) : Order.Order {
      switch (s1, s2) {
        case (#Open, #Open) { #equal };
        case (#Open, _) { #less };
        case (_, #Open) { #greater };

        case (#InProgress, #InProgress) { #equal };
        case (#InProgress, _) { #less };
        case (_, #InProgress) { #greater };

        case (#Resolved, #Resolved) { #equal };
      };
    };
  };

  module UserRole {
    public type Type = { #Admin; #User };
    public func compare(r1 : Type, r2 : Type) : Order.Order {
      switch (r1, r2) {
        case (#Admin, #Admin) { #equal };
        case (#Admin, #User) { #less };
        case (#User, #Admin) { #greater };
        case (#User, #User) { #equal };
      };
    };
  };

  module UserProfile {
    public type Type = {
      principal : Principal;
      name : Text;
      role : UserRole.Type;
    };
    public func compare(p1 : Type, p2 : Type) : Order.Order {
      Principal.compare(p1.principal, p2.principal);
    };
  };

  module Issue {
    public type Type = {
      id : Nat;
      title : Text;
      description : Text;
      category : Category.Type;
      status : Status.Type;
      photoUrl : ?Text;
      lat : Float;
      lng : Float;
      reporterId : Principal;
      upvotes : Nat;
      createdAt : Int;
      resolvedAt : ?Int;
    };

    public func compare(i1 : Type, i2 : Type) : Order.Order {
      Nat.compare(i1.id, i2.id);
    };
  };
  module IssueDTO {
    public type Type = {
      id : Nat;
      title : Text;
      description : Text;
      category : Text;
      status : Text;
      photoUrl : ?Text;
      lat : Float;
      lng : Float;
      reporterId : Principal;
      upvotes : Nat;
      createdAt : Int;
      resolvedAt : ?Int;
    };
    func compare(i1 : Type, i2 : Type) : Order.Order {
      Nat.compare(i1.id, i2.id);
    };
  };
  module AdminStats {
    public type Type = {
      totalIssues : Nat;
      openIssues : Nat;
      inProgress : Nat;
      resolved : Nat;
    };
    func compare(a1 : Type, a2 : Type) : Order.Order {
      Nat.compare(a1.totalIssues, a2.totalIssues);
    };
  };
  module HeatmapData {
    public type Type = {
      lat : Float;
      lng : Float;
      weight : Nat;
    };
    func compare(h1 : Type, h2 : Type) : Order.Order {
      switch (Float.compare(h1.lat, h2.lat)) {
        case (#equal) { Float.compare(h1.lng, h2.lng) };
        case (order) { order };
      };
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  var nextIssueId = 1;

  let issues = Map.empty<Nat, Issue.Type>();
  let userProfiles = Map.empty<Principal, UserProfile.Type>();
  let issueUpvotes = Map.empty<Nat, Set.Set<Principal>>();

  func ensureUserRole(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: User role required");
    };
  };

  public shared ({ caller }) func createIssue(title : Text, description : Text, category : Text, photoUrl : ?Text, lat : Float, lng : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create issues");
    };

    let sysTimeToUnixTime = Time.now;

    let issue = {
      id = nextIssueId;
      title;
      description;
      category = toEnumCategory(category);
      status = #Open;
      photoUrl;
      lat;
      lng;
      reporterId = caller;
      upvotes = 0;
      createdAt = sysTimeToUnixTime();
      resolvedAt = null;
    };

    issues.add(nextIssueId, issue);
    nextIssueId += 1;
    nextIssueId - 1 : Nat;
  };

  func toEnumCategory(category : Text) : Category.Type {
    switch (category) {
      case ("StreetLight") { #StreetLight };
      case ("Trash") { #Trash };
      case ("RoadDamage") { #RoadDamage };
      case ("Water") { #Water };
      case (_) { #Other };
    };
  };

  func categoryToText(category : Category.Type) : Text {
    switch (category) {
      case (#StreetLight) { "StreetLight" };
      case (#Trash) { "Trash" };
      case (#RoadDamage) { "RoadDamage" };
      case (#Water) { "Water" };
      case (#Other) { "Other" };
    };
  };

  func statusToText(status : Status.Type) : Text {
    switch (status) {
      case (#Open) { "Open" };
      case (#InProgress) { "InProgress" };
      case (#Resolved) { "Resolved" };
    };
  };

  func toEnumStatus(status : Text) : Status.Type {
    switch (status) {
      case ("Open") { #Open };
      case ("InProgress") { #InProgress };
      case ("Resolved") { #Resolved };
      case (_) { #Open };
    };
  };

  func mapIssueToDTO(issue : Issue.Type) : IssueDTO.Type {
    {
      issue with
      category = categoryToText(issue.category);
      status = statusToText(issue.status);
      resolvedAt = issue.resolvedAt;
    };
  };

  public query ({ caller }) func getIssues() : async [IssueDTO.Type] {
    // Public endpoint - no authorization required (guests allowed)
    issues.values().toArray().sort().map(mapIssueToDTO);
  };

  public query ({ caller }) func getIssuesByCategory(category : Text) : async [IssueDTO.Type] {
    // Public endpoint - no authorization required (guests allowed)
    issues.values().toArray().filter(func(i) { categoryToText(i.category) == category }).sort().map(mapIssueToDTO);
  };

  public query ({ caller }) func getIssuesByStatus(status : Text) : async [IssueDTO.Type] {
    // Public endpoint - no authorization required (guests allowed)
    issues.values().toArray().filter(func(i) { statusToText(i.status) == status }).sort().map(mapIssueToDTO);
  };

  public shared ({ caller }) func upvoteIssue(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upvote issues");
    };

    switch (issues.get(id)) {
      case (null) { false };
      case (?issue) {
        let upvoters = switch (issueUpvotes.get(id)) {
          case (null) { Set.empty<Principal>() };
          case (?s) { s };
        };

        if (upvoters.contains(caller)) {
          false;
        } else {
          upvoters.add(caller);
          let updatedIssue = {
            issue with
            upvotes = issue.upvotes + 1;
          };
          issues.add(id, updatedIssue);
          issueUpvotes.add(id, upvoters);
          true;
        };
      };
    };
  };

  public shared ({ caller }) func updateIssueStatus(id : Nat, status : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update issue status");
    };

    switch (issues.get(id)) {
      case (null) { false };
      case (?issue) {
        let updatedStatus = toEnumStatus(status);
        let updatedIssue = {
          issue with
          status = updatedStatus;
          resolvedAt = if (updatedStatus == #Resolved) { ?Time.now() } else { null };
        };
        issues.add(id, updatedIssue);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteIssue(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete issues");
    };

    let existed = issues.containsKey(id);
    issues.remove(id);
    issueUpvotes.remove(id);
    existed;
  };

  public query ({ caller }) func getHeatmapData() : async [HeatmapData.Type] {
    // Public endpoint - no authorization required (guests allowed)
    issues.values().toArray().map(func(i) { { lat = i.lat; lng = i.lng; weight = i.upvotes + 1 } });
  };

  public shared ({ caller }) func getOrCreateProfile(name : Text) : async UserProfile.Type {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) {
        let role = if (AccessControl.isAdmin(accessControlState, caller)) { #Admin } else { #User };
        let newProfile = {
          principal = caller;
          name;
          role;
        };
        userProfiles.add(caller, newProfile);
        newProfile;
      };
    };
  };

  public query ({ caller }) func getMyProfile() : async ?UserProfile.Type {
    // Public endpoint - no authorization required (guests allowed)
    userProfiles.get(caller);
  };

  public query ({ caller }) func getIssueCount() : async Nat {
    // Public endpoint - no authorization required (guests allowed)
    issues.size();
  };

  public query ({ caller }) func getIssuesByReporter(reporter : Principal) : async [IssueDTO.Type] {
    // Public endpoint - no authorization required (guests allowed)
    issues.values().toArray().filter(func(i) { i.reporterId == reporter }).sort().map(mapIssueToDTO);
  };

  public query ({ caller }) func getAdminStats() : async AdminStats.Type {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access stats");
    };

    var open = 0;
    var inProgress = 0;
    var resolved = 0;

    for (issue in issues.values()) {
      switch (issue.status) {
        case (#Open) { open += 1 };
        case (#InProgress) { inProgress += 1 };
        case (#Resolved) { resolved += 1 };
      };
    };

    {
      totalIssues = issues.size();
      openIssues = open;
      inProgress;
      resolved;
    };
  };
};
