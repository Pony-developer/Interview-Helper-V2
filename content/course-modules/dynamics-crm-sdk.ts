/**
 * A small, shared model of the Dataverse SDK (Microsoft.Xrm.Sdk) and a fake platform for the
 * C# practices of the "Dynamics CRM Development" course. Wandbox has no NuGet packages and runs
 * Mono's C# 7 compiler, so the practices carry this code in their program instead of the real SDK.
 *
 * Code written against it looks like real Dataverse code: IPlugin, IServiceProvider.GetService,
 * IPluginExecutionContext with InputParameters, OutputParameters, SharedVariables and entity images,
 * IOrganizationService with QueryByAttribute and Execute (typed requests, ExecuteMultiple),
 * and custom workflow activities (CodeActivity, InArgument, OutArgument, IWorkflowContext).
 *
 *   PROGRAM_WITH(`${XRM_SDK}\n\n${XRM_FAKES}\n\n<the task's types>`, main, XRM_USINGS, members)
 */

export const XRM_USINGS = "using System.Collections.Generic;\nusing System.Linq;";

/** The SDK types a plug-in uses. Names and shapes follow Microsoft.Xrm.Sdk and its Messages namespaces. */
export const XRM_SDK = `// ===== A small model of the Dataverse SDK (Microsoft.Xrm.Sdk) =====
class EntityReference
{
    public string LogicalName;
    public Guid Id;
    public string Name;

    public EntityReference(string logicalName, Guid id) { LogicalName = logicalName; Id = id; }

    public override string ToString() { return LogicalName + "(" + Id.ToString().Substring(0, 8) + ")"; }
}

class OptionSetValue
{
    public int Value;

    public OptionSetValue(int value) { Value = value; }

    public override string ToString() { return Value.ToString(); }
}

class Money
{
    public decimal Value;

    public Money(decimal value) { Value = value; }

    public override string ToString() { return Value.ToString(System.Globalization.CultureInfo.InvariantCulture); }
}

class Entity
{
    public string LogicalName;
    public Guid Id;
    public readonly Dictionary<string, object> Attributes = new Dictionary<string, object>();

    public Entity(string logicalName) { LogicalName = logicalName; }
    public Entity(string logicalName, Guid id) { LogicalName = logicalName; Id = id; }

    // Like the real SDK: reading a column that is not in the entity throws KeyNotFoundException
    public object this[string name]
    {
        get { return Attributes[name]; }
        set { Attributes[name] = value; }
    }

    public bool Contains(string name) { return Attributes.ContainsKey(name); }

    // Returns default(T) when the column is missing or null
    public T GetAttributeValue<T>(string name)
    {
        object value;
        return Attributes.TryGetValue(name, out value) && value != null ? (T)value : default(T);
    }

    public EntityReference ToEntityReference() { return new EntityReference(LogicalName, Id); }

    public override string ToString()
    {
        return LogicalName + "(" + Id.ToString().Substring(0, 8) + ") " +
            string.Join(" ", Attributes.OrderBy(a => a.Key, StringComparer.Ordinal).Select(a => a.Key + "=" + a.Value));
    }
}

class ColumnSet
{
    public readonly bool AllColumns;
    public readonly List<string> Columns = new List<string>();

    public ColumnSet(bool allColumns) { AllColumns = allColumns; }
    public ColumnSet(params string[] columns) { Columns.AddRange(columns); }
}

class EntityCollection
{
    public readonly List<Entity> Entities = new List<Entity>();
}

abstract class QueryBase { }

// Equality conditions joined with AND, the simplest query type
class QueryByAttribute : QueryBase
{
    public string EntityName;
    public ColumnSet ColumnSet = new ColumnSet(true);
    public readonly List<string> Attributes = new List<string>();
    public readonly List<object> Values = new List<object>();

    public QueryByAttribute(string entityName) { EntityName = entityName; }

    public void AddAttributeValue(string attribute, object value)
    {
        Attributes.Add(attribute);
        Values.Add(value);
    }
}

class ParameterCollection : Dictionary<string, object>
{
    public bool Contains(string key) { return ContainsKey(key); }
}

class EntityImageCollection : Dictionary<string, Entity>
{
    public bool Contains(string key) { return ContainsKey(key); }
}

class InvalidPluginExecutionException : Exception
{
    public InvalidPluginExecutionException(string message) : base(message) { }
}

// What the service throws for a missing record and other server errors
class FaultException : Exception
{
    public FaultException(string message) : base(message) { }
}

// --- Messages: every operation is a request with Parameters and a response with Results ---
class OrganizationRequest
{
    public string RequestName;
    public readonly ParameterCollection Parameters = new ParameterCollection();

    public OrganizationRequest() { }
    public OrganizationRequest(string requestName) { RequestName = requestName; }

    public object this[string key]
    {
        get { return Parameters[key]; }
        set { Parameters[key] = value; }
    }
}

class OrganizationResponse
{
    public string ResponseName;
    public readonly ParameterCollection Results = new ParameterCollection();

    public object this[string key] { get { return Results[key]; } }
}

class CreateRequest : OrganizationRequest
{
    public CreateRequest() : base("Create") { }
    public Entity Target { get { return (Entity)Parameters["Target"]; } set { Parameters["Target"] = value; } }
}

class CreateResponse : OrganizationResponse
{
    public Guid id { get { return (Guid)Results["id"]; } }
}

class RetrieveRequest : OrganizationRequest
{
    public RetrieveRequest() : base("Retrieve") { }
    public EntityReference Target { get { return (EntityReference)Parameters["Target"]; } set { Parameters["Target"] = value; } }
    public ColumnSet ColumnSet { get { return (ColumnSet)Parameters["ColumnSet"]; } set { Parameters["ColumnSet"] = value; } }
}

class RetrieveResponse : OrganizationResponse
{
    public Entity Entity { get { return (Entity)Results["Entity"]; } }
}

class UpdateRequest : OrganizationRequest
{
    public UpdateRequest() : base("Update") { }
    public Entity Target { get { return (Entity)Parameters["Target"]; } set { Parameters["Target"] = value; } }
}

class UpdateResponse : OrganizationResponse { }

class DeleteRequest : OrganizationRequest
{
    public DeleteRequest() : base("Delete") { }
    public EntityReference Target { get { return (EntityReference)Parameters["Target"]; } set { Parameters["Target"] = value; } }
}

class DeleteResponse : OrganizationResponse { }

class RetrieveMultipleRequest : OrganizationRequest
{
    public RetrieveMultipleRequest() : base("RetrieveMultiple") { }
    public QueryBase Query { get { return (QueryBase)Parameters["Query"]; } set { Parameters["Query"] = value; } }
}

class RetrieveMultipleResponse : OrganizationResponse
{
    public EntityCollection EntityCollection { get { return (EntityCollection)Results["EntityCollection"]; } }
}

class WhoAmIRequest : OrganizationRequest
{
    public WhoAmIRequest() : base("WhoAmI") { }
}

class WhoAmIResponse : OrganizationResponse
{
    public Guid UserId { get { return (Guid)Results["UserId"]; } }
}

class OrganizationRequestCollection : List<OrganizationRequest> { }

class ExecuteMultipleSettings
{
    public bool ContinueOnError;
    public bool ReturnResponses;
}

class ExecuteMultipleRequest : OrganizationRequest
{
    public ExecuteMultipleRequest() : base("ExecuteMultiple") { }
    public OrganizationRequestCollection Requests { get { return (OrganizationRequestCollection)Parameters["Requests"]; } set { Parameters["Requests"] = value; } }
    public ExecuteMultipleSettings Settings { get { return (ExecuteMultipleSettings)Parameters["Settings"]; } set { Parameters["Settings"] = value; } }
}

class OrganizationServiceFault
{
    public string Message;
}

class ExecuteMultipleResponseItem
{
    public int RequestIndex;
    public OrganizationResponse Response;   // null unless ReturnResponses is true
    public OrganizationServiceFault Fault;  // null when the request succeeded
}

class ExecuteMultipleResponse : OrganizationResponse
{
    public bool IsFaulted { get { return (bool)Results["IsFaulted"]; } }
    public List<ExecuteMultipleResponseItem> Responses { get { return (List<ExecuteMultipleResponseItem>)Results["Responses"]; } }
}

// --- Services the platform gives to plug-ins ---
interface IOrganizationService
{
    Guid Create(Entity entity);
    Entity Retrieve(string entityName, Guid id, ColumnSet columnSet);
    void Update(Entity entity);
    void Delete(string entityName, Guid id);
    EntityCollection RetrieveMultiple(QueryBase query);
    OrganizationResponse Execute(OrganizationRequest request);
}

interface IOrganizationServiceFactory
{
    IOrganizationService CreateOrganizationService(Guid? userId);
}

interface ITracingService
{
    void Trace(string format, params object[] args);
}

interface IPluginExecutionContext
{
    string MessageName { get; }
    string PrimaryEntityName { get; }
    Guid PrimaryEntityId { get; }
    int Stage { get; }             // 10 PreValidation, 20 PreOperation, 40 PostOperation
    int Mode { get; }              // 0 synchronous, 1 asynchronous
    int Depth { get; }
    Guid UserId { get; }
    Guid InitiatingUserId { get; }
    ParameterCollection InputParameters { get; }
    ParameterCollection OutputParameters { get; }
    ParameterCollection SharedVariables { get; }
    EntityImageCollection PreEntityImages { get; }
    EntityImageCollection PostEntityImages { get; }
}

interface IPlugin
{
    void Execute(IServiceProvider serviceProvider);
}`;

/** The fake platform: an in-memory database and the services a plug-in receives. */
export const XRM_FAKES = `// ===== The fake platform: an in-memory database and the services a plug-in receives =====
class FakeDatabase
{
    public static readonly Guid SystemUserId = new Guid("ffffffff-0000-0000-0000-000000000000");
    public readonly List<Entity> Rows = new List<Entity>();
    public int Calls;   // calls made to IOrganizationService, like round trips to the server
    int lastId;

    public FakeDatabase()
    {
        var system = new Entity("systemuser", SystemUserId);
        system["fullname"] = "SYSTEM";
        Rows.Add(system);
    }

    public Guid NewId() { return new Guid(++lastId, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); }

    // Seeds a row directly, without plug-ins or security: test data
    public Guid Insert(Entity entity)
    {
        var row = Copy(entity, new ColumnSet(true));
        if (row.Id == Guid.Empty) row.Id = NewId();
        Rows.Add(row);
        return row.Id;
    }

    public Entity Find(string entityName, Guid id)
    {
        var row = Rows.FirstOrDefault(r => r.LogicalName == entityName && r.Id == id);
        if (row == null) throw new FaultException(entityName + " With Id = " + id + " Does Not Exist");
        return row;
    }

    public IEnumerable<Entity> All(string entityName) { return Rows.Where(r => r.LogicalName == entityName); }

    public string NameOf(EntityReference reference)
    {
        if (reference == null) return "-";
        var row = Find(reference.LogicalName, reference.Id);
        return row.GetAttributeValue<string>("fullname") ?? row.GetAttributeValue<string>("name") ?? reference.ToString();
    }

    public static Entity Copy(Entity source, ColumnSet columns)
    {
        var copy = new Entity(source.LogicalName, source.Id);
        foreach (var attribute in source.Attributes)
            if (columns.AllColumns || columns.Columns.Contains(attribute.Key))
                copy[attribute.Key] = attribute.Value;
        return copy;
    }

    // How a stored value compares with a query value: choices by number, lookups by id
    public static bool Matches(object stored, object wanted)
    {
        if (stored is OptionSetValue) stored = ((OptionSetValue)stored).Value;
        if (stored is EntityReference) stored = ((EntityReference)stored).Id;
        if (stored is Money) stored = ((Money)stored).Value;
        if (wanted is EntityReference) wanted = ((EntityReference)wanted).Id;
        return Equals(stored, wanted);
    }
}

class FakeOrganizationService : IOrganizationService
{
    readonly FakeDatabase db;
    readonly Guid userId;

    public FakeOrganizationService(FakeDatabase db, Guid userId) { this.db = db; this.userId = userId; }

    public Guid Create(Entity entity) { db.Calls++; return DoCreate(entity); }
    public Entity Retrieve(string entityName, Guid id, ColumnSet columnSet) { db.Calls++; return FakeDatabase.Copy(db.Find(entityName, id), columnSet); }
    public void Update(Entity entity) { db.Calls++; DoUpdate(entity); }
    public void Delete(string entityName, Guid id) { db.Calls++; db.Rows.Remove(db.Find(entityName, id)); }
    public EntityCollection RetrieveMultiple(QueryBase query) { db.Calls++; return DoRetrieveMultiple(query); }
    public OrganizationResponse Execute(OrganizationRequest request) { db.Calls++; return Dispatch(request, true); }

    Guid DoCreate(Entity entity)
    {
        var row = FakeDatabase.Copy(entity, new ColumnSet(true));
        if (row.Id == Guid.Empty) row.Id = db.NewId();
        else if (db.Rows.Any(r => r.LogicalName == row.LogicalName && r.Id == row.Id))
            throw new FaultException("Cannot insert duplicate key: " + row.LogicalName + " " + row.Id);
        // Like the platform: a new record belongs to the user the service runs as, unless ownerid is set
        if (!row.Contains("ownerid")) row["ownerid"] = new EntityReference("systemuser", userId);
        row["createdby"] = new EntityReference("systemuser", userId);
        db.Rows.Add(row);
        return row.Id;
    }

    void DoUpdate(Entity entity)
    {
        var row = db.Find(entity.LogicalName, entity.Id);
        foreach (var attribute in entity.Attributes) row[attribute.Key] = attribute.Value;
    }

    EntityCollection DoRetrieveMultiple(QueryBase query)
    {
        var byAttribute = query as QueryByAttribute;
        if (byAttribute == null) throw new FaultException("This fake supports only QueryByAttribute");
        var result = new EntityCollection();
        foreach (var row in db.All(byAttribute.EntityName))
        {
            bool all = true;
            for (int i = 0; i < byAttribute.Attributes.Count; i++)
            {
                object stored;
                if (!row.Attributes.TryGetValue(byAttribute.Attributes[i], out stored) || !FakeDatabase.Matches(stored, byAttribute.Values[i])) all = false;
            }
            if (all) result.Entities.Add(FakeDatabase.Copy(row, byAttribute.ColumnSet));
        }
        return result;
    }

    OrganizationResponse Dispatch(OrganizationRequest request, bool allowBatch)
    {
        OrganizationResponse response;
        switch (request.RequestName)
        {
            case "Create":
                response = new CreateResponse();
                response.Results["id"] = DoCreate((Entity)request["Target"]);
                break;
            case "Retrieve":
                var target = (EntityReference)request["Target"];
                response = new RetrieveResponse();
                response.Results["Entity"] = FakeDatabase.Copy(db.Find(target.LogicalName, target.Id), (ColumnSet)request["ColumnSet"]);
                break;
            case "Update":
                DoUpdate((Entity)request["Target"]);
                response = new UpdateResponse();
                break;
            case "Delete":
                var deleted = (EntityReference)request["Target"];
                db.Rows.Remove(db.Find(deleted.LogicalName, deleted.Id));
                response = new DeleteResponse();
                break;
            case "RetrieveMultiple":
                response = new RetrieveMultipleResponse();
                response.Results["EntityCollection"] = DoRetrieveMultiple((QueryBase)request["Query"]);
                break;
            case "WhoAmI":
                response = new WhoAmIResponse();
                response.Results["UserId"] = userId;
                break;
            case "ExecuteMultiple":
                if (!allowBatch) throw new FaultException("ExecuteMultiple cannot contain another ExecuteMultiple");
                response = ExecuteMultiple((ExecuteMultipleRequest)request);
                break;
            default:
                throw new FaultException("Unrecognized request name: " + request.RequestName);
        }
        response.ResponseName = request.RequestName;
        return response;
    }

    // Not a transaction: requests that succeeded stay saved even when a later one fails
    ExecuteMultipleResponse ExecuteMultiple(ExecuteMultipleRequest request)
    {
        if (request.Requests.Count > 1000) throw new FaultException("The ExecuteMultiple request has more than 1000 requests");
        var items = new List<ExecuteMultipleResponseItem>();
        bool faulted = false;
        for (int i = 0; i < request.Requests.Count; i++)
        {
            try
            {
                var response = Dispatch(request.Requests[i], false);
                if (request.Settings.ReturnResponses) items.Add(new ExecuteMultipleResponseItem { RequestIndex = i, Response = response });
            }
            catch (FaultException ex)
            {
                faulted = true;
                items.Add(new ExecuteMultipleResponseItem { RequestIndex = i, Fault = new OrganizationServiceFault { Message = ex.Message } });
                if (!request.Settings.ContinueOnError) break;
            }
        }
        var result = new ExecuteMultipleResponse();
        result.Results["IsFaulted"] = faulted;
        result.Results["Responses"] = items;
        return result;
    }
}

class FakeServiceFactory : IOrganizationServiceFactory
{
    readonly FakeDatabase db;

    public FakeServiceFactory(FakeDatabase db) { this.db = db; }

    // null means SYSTEM, as in the real platform
    public IOrganizationService CreateOrganizationService(Guid? userId)
    {
        return new FakeOrganizationService(db, userId ?? FakeDatabase.SystemUserId);
    }
}

class FakeTracingService : ITracingService
{
    public readonly List<string> Lines = new List<string>();

    public void Trace(string format, params object[] args)
    {
        Lines.Add(args.Length == 0 ? format : string.Format(System.Globalization.CultureInfo.InvariantCulture, format, args));
    }
}

class FakePluginContext : IPluginExecutionContext
{
    public string MessageName { get; set; }
    public string PrimaryEntityName { get; set; }
    public Guid PrimaryEntityId { get; set; }
    public int Stage { get; set; }
    public int Mode { get; set; }
    public int Depth { get; set; }
    public Guid UserId { get; set; }
    public Guid InitiatingUserId { get; set; }
    public ParameterCollection InputParameters { get; private set; }
    public ParameterCollection OutputParameters { get; private set; }
    public ParameterCollection SharedVariables { get; private set; }
    public EntityImageCollection PreEntityImages { get; private set; }
    public EntityImageCollection PostEntityImages { get; private set; }

    public FakePluginContext()
    {
        Depth = 1;
        InputParameters = new ParameterCollection();
        OutputParameters = new ParameterCollection();
        SharedVariables = new ParameterCollection();
        PreEntityImages = new EntityImageCollection();
        PostEntityImages = new EntityImageCollection();
    }
}

class FakeServiceProvider : IServiceProvider
{
    readonly Dictionary<Type, object> services = new Dictionary<Type, object>();

    public FakeServiceProvider(IPluginExecutionContext context, ITracingService tracing, IOrganizationServiceFactory factory)
    {
        services[typeof(IPluginExecutionContext)] = context;
        services[typeof(ITracingService)] = tracing;
        services[typeof(IOrganizationServiceFactory)] = factory;
    }

    public object GetService(Type serviceType)
    {
        object service;
        return services.TryGetValue(serviceType, out service) ? service : null;
    }
}`;

/**
 * Custom workflow activities: Windows Workflow Foundation's CodeActivity and arguments,
 * and Microsoft.Xrm.Sdk.Workflow's attributes and IWorkflowContext. Needs XRM_SDK.
 */
export const XRM_WORKFLOW = `// ===== A small model of System.Activities and Microsoft.Xrm.Sdk.Workflow =====
class CodeActivityContext
{
    readonly Dictionary<Type, object> extensions = new Dictionary<Type, object>();
    public readonly Dictionary<object, object> ArgumentValues = new Dictionary<object, object>();

    public void AddExtension<T>(T extension) { extensions[typeof(T)] = extension; }

    public T GetExtension<T>()
    {
        object extension;
        return extensions.TryGetValue(typeof(T), out extension) ? (T)extension : default(T);
    }
}

class InArgument<T>
{
    readonly T value;

    public InArgument() { }
    public InArgument(T value) { this.value = value; }

    public T Get(CodeActivityContext context) { return value; }
}

class OutArgument<T>
{
    public void Set(CodeActivityContext context, T value) { context.ArgumentValues[this] = value; }

    public T Get(CodeActivityContext context)
    {
        object value;
        return context.ArgumentValues.TryGetValue(this, out value) ? (T)value : default(T);
    }
}

abstract class CodeActivity
{
    protected abstract void Execute(CodeActivityContext context);

    // What the workflow engine calls
    public void Invoke(CodeActivityContext context) { Execute(context); }
}

[AttributeUsage(AttributeTargets.Property)]
class InputAttribute : Attribute { public string Name; public InputAttribute(string name) { Name = name; } }

[AttributeUsage(AttributeTargets.Property)]
class OutputAttribute : Attribute { public string Name; public OutputAttribute(string name) { Name = name; } }

[AttributeUsage(AttributeTargets.Property)]
class RequiredArgumentAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Property)]
class ReferenceTargetAttribute : Attribute { public string EntityName; public ReferenceTargetAttribute(string entityName) { EntityName = entityName; } }

[AttributeUsage(AttributeTargets.Property)]
class DefaultAttribute : Attribute { public string Value; public DefaultAttribute(string value) { Value = value; } }

interface IWorkflowContext
{
    string MessageName { get; }
    string PrimaryEntityName { get; }
    Guid PrimaryEntityId { get; }
    int Depth { get; }
    Guid UserId { get; }
    Guid InitiatingUserId { get; }
    ParameterCollection InputParameters { get; }
    ParameterCollection SharedVariables { get; }
}

class FakeWorkflowContext : IWorkflowContext
{
    public string MessageName { get; set; }
    public string PrimaryEntityName { get; set; }
    public Guid PrimaryEntityId { get; set; }
    public int Depth { get; set; }
    public Guid UserId { get; set; }
    public Guid InitiatingUserId { get; set; }
    public ParameterCollection InputParameters { get; private set; }
    public ParameterCollection SharedVariables { get; private set; }

    public FakeWorkflowContext()
    {
        Depth = 1;
        InputParameters = new ParameterCollection();
        SharedVariables = new ParameterCollection();
    }
}`;
