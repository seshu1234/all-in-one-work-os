from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timezone, timedelta
import os
import logging
import uuid
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============================================================================
# AUTHENTICATION MODELS & UTILITIES
# ============================================================================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    full_name: Optional[str] = None
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ============================================================================
# MODULE MODELS - Part 1: Base 12 Modules
# ============================================================================

# 1. Organization Goals
class OrganizationGoal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    goal_title: str
    description: str
    owner_id: str
    start_date: str
    end_date: str
    status: str
    success_metrics: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrganizationGoalCreate(BaseModel):
    goal_title: str
    description: str
    owner_id: str
    start_date: str
    end_date: str
    status: str
    success_metrics: str

# 2. Idea Suggestions
class IdeaSuggestion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    associated_goal_id: Optional[str] = None
    idea_title: str
    idea_description: str
    submitted_by_id: str
    submit_anonymously: bool = False
    status: str
    manager_comments: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IdeaSuggestionCreate(BaseModel):
    associated_goal_id: Optional[str] = None
    idea_title: str
    idea_description: str
    submitted_by_id: str
    submit_anonymously: bool = False
    status: str = "New"
    manager_comments: Optional[str] = None

# 3. Tasks
class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_title: str
    description: str
    linked_idea_id: Optional[str] = None
    assigned_to_id: str
    priority: str
    status: str
    deadline: str
    comments: Optional[str] = None
    attachments: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaskCreate(BaseModel):
    task_title: str
    description: str
    linked_idea_id: Optional[str] = None
    assigned_to_id: str
    priority: str
    status: str = "To Do"
    deadline: str
    comments: Optional[str] = None
    attachments: Optional[str] = None

# 4. Meeting Notes
class MeetingNote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    meeting_title: str
    raw_notes: str
    auto_extracted_action_items: Optional[str] = None
    assigned_stakeholders: List[str] = []
    next_review_date: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MeetingNoteCreate(BaseModel):
    meeting_title: str
    raw_notes: str
    auto_extracted_action_items: Optional[str] = None
    assigned_stakeholders: List[str] = []
    next_review_date: Optional[str] = None

# 5. Client/Lead Conversation Log
class ClientConversation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_lead_name: str
    conversation_summary: str
    key_follow_ups: str
    owner_id: str
    priority: str
    next_contact_date: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientConversationCreate(BaseModel):
    client_lead_name: str
    conversation_summary: str
    key_follow_ups: str
    owner_id: str
    priority: str
    next_contact_date: Optional[str] = None

# 6. Content Idea Bank
class ContentIdea(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    idea_title: str
    description_script_notes: str
    tags: List[str] = []
    submitted_by_id: str
    used_in_content_id: Optional[str] = None
    status: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContentIdeaCreate(BaseModel):
    idea_title: str
    description_script_notes: str
    tags: List[str] = []
    submitted_by_id: str
    used_in_content_id: Optional[str] = None
    status: str = "New"

# 7. Creative Requests
class CreativeRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request_title: str
    type: str
    brief_requirements: str
    references_brand_assets: Optional[str] = None
    requested_by_id: str
    assigned_designer_id: Optional[str] = None
    status: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreativeRequestCreate(BaseModel):
    request_title: str
    type: str
    brief_requirements: str
    references_brand_assets: Optional[str] = None
    requested_by_id: str
    assigned_designer_id: Optional[str] = None
    status: str = "To Do"

# 8. Asset Library
class Asset(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    asset_name: str
    file: str
    tags: List[str] = []
    created_by_id: str
    linked_tasks: List[str] = []
    download_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AssetCreate(BaseModel):
    asset_name: str
    file: str
    tags: List[str] = []
    created_by_id: str
    linked_tasks: List[str] = []

# 9. Performance Campaigns
class PerformanceCampaign(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    campaign_name: str
    platform: str
    spend: float
    results_metrics: str
    learnings: str
    linked_creative_assets: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PerformanceCampaignCreate(BaseModel):
    campaign_name: str
    platform: str
    spend: float
    results_metrics: str
    learnings: str
    linked_creative_assets: List[str] = []

# 10. Skill Directory
class SkillDirectory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employee_id: str
    team: str
    skills: List[str] = []
    tools_used: List[str] = []
    notable_projects: str
    preferred_contact_method: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SkillDirectoryCreate(BaseModel):
    employee_id: str
    team: str
    skills: List[str] = []
    tools_used: List[str] = []
    notable_projects: str
    preferred_contact_method: str

# 11. Knowledge Hub
class KnowledgeHub(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    topic_title: str
    category: str
    detailed_sop_steps: str
    attachments: Optional[str] = None
    added_by_id: str
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class KnowledgeHubCreate(BaseModel):
    topic_title: str
    category: str
    detailed_sop_steps: str
    attachments: Optional[str] = None
    added_by_id: str

# 12. Shoutouts
class Shoutout(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_user_id: str
    to_user_id: str
    message: str
    related_work_id: Optional[str] = None
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ShoutoutCreate(BaseModel):
    from_user_id: str
    to_user_id: str
    message: str
    related_work_id: Optional[str] = None

# ============================================================================
# MODULE MODELS - Part 2: Additional 3 Modules (KPIs, KRIs, Scorecards)
# ============================================================================

# 13. KPIs
class KPI(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    kpi_name: str
    associated_goal_id: Optional[str] = None
    owner_id: str
    measurement_frequency: str
    current_value: float
    target_value: float
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    update_notes: Optional[str] = None
    flagged: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class KPICreate(BaseModel):
    kpi_name: str
    associated_goal_id: Optional[str] = None
    owner_id: str
    measurement_frequency: str
    current_value: float
    target_value: float
    update_notes: Optional[str] = None

# 14. KRIs
class KRI(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    risk_area: str
    associated_goal_id: Optional[str] = None
    risk_description: str
    risk_level: str
    mitigation_owner_id: str
    action_plan: str
    status: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class KRICreate(BaseModel):
    risk_area: str
    associated_goal_id: Optional[str] = None
    risk_description: str
    risk_level: str
    mitigation_owner_id: str
    action_plan: str
    status: str = "Monitoring"

# 15. Team Scorecards
class TeamScorecard(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    team_name: str
    reporting_period: str
    goals_progress_summary: str
    kpi_performance_summary: str
    risks_issues: str
    wins_recognitions: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TeamScorecardCreate(BaseModel):
    team_name: str
    reporting_period: str
    goals_progress_summary: str
    kpi_performance_summary: str
    risks_issues: str
    wins_recognitions: str

# ============================================================================
# AUTHENTICATION ROUTES
# ============================================================================

@api_router.post("/auth/signup", response_model=Token)
async def signup(user_data: UserCreate):
    existing_user = await db.users.find_one({"username": user_data.username}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    existing_email = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password)
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    access_token = create_access_token(data={"sub": user.id})
    user_response = UserResponse(id=user.id, username=user.username, email=user.email, full_name=user.full_name)
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"username": credentials.username}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['hashed_password']):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user['id']})
    user_response = UserResponse(id=user['id'], username=user['username'], email=user['email'], full_name=user.get('full_name'))
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(id=current_user['id'], username=current_user['username'], email=current_user['email'], full_name=current_user.get('full_name'))

@api_router.get("/users", response_model=List[UserResponse])
async def get_all_users(current_user: dict = Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0, "hashed_password": 0}).to_list(1000)
    return [UserResponse(**user) for user in users]

# ============================================================================
# CRUD ROUTES FOR ALL 15 MODULES
# (Due to length, implementing compact CRUD pattern)
# ============================================================================

# Helper function to convert datetime strings
def parse_datetimes(doc, fields=['created_at', 'last_updated', 'date']):
    for field in fields:
        if field in doc and isinstance(doc[field], str):
            doc[field] = datetime.fromisoformat(doc[field])
    return doc

# Organization Goals
@api_router.post("/goals", response_model=OrganizationGoal)
async def create_goal(goal: OrganizationGoalCreate, current_user: dict = Depends(get_current_user)):
    obj = OrganizationGoal(**goal.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.organization_goals.insert_one(doc)
    return obj

@api_router.get("/goals", response_model=List[OrganizationGoal])
async def get_goals(current_user: dict = Depends(get_current_user)):
    items = await db.organization_goals.find({}, {"_id": 0}).to_list(1000)
    return [parse_datetimes(item) for item in items]

@api_router.get("/goals/{id}", response_model=OrganizationGoal)
async def get_goal(id: str, current_user: dict = Depends(get_current_user)):
    item = await db.organization_goals.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.put("/goals/{id}", response_model=OrganizationGoal)
async def update_goal(id: str, data: OrganizationGoalCreate, current_user: dict = Depends(get_current_user)):
    await db.organization_goals.update_one({"id": id}, {"$set": data.model_dump()})
    item = await db.organization_goals.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.delete("/goals/{id}")
async def delete_goal(id: str, current_user: dict = Depends(get_current_user)):
    result = await db.organization_goals.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# Ideas
@api_router.post("/ideas", response_model=IdeaSuggestion)
async def create_idea(idea: IdeaSuggestionCreate, current_user: dict = Depends(get_current_user)):
    obj = IdeaSuggestion(**idea.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.idea_suggestions.insert_one(doc)
    
    # Auto-create task if accepted
    if idea.status == "Accepted":
        task = Task(task_title=f"Task: {idea.idea_title}", description=idea.idea_description,
                   linked_idea_id=obj.id, assigned_to_id=idea.submitted_by_id, priority="Medium",
                   status="To Do", deadline=(datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%d"))
        tdoc = task.model_dump()
        tdoc['created_at'] = tdoc['created_at'].isoformat()
        await db.tasks.insert_one(tdoc)
    return obj

@api_router.get("/ideas", response_model=List[IdeaSuggestion])
async def get_ideas(current_user: dict = Depends(get_current_user)):
    items = await db.idea_suggestions.find({}, {"_id": 0}).to_list(1000)
    return [parse_datetimes(item) for item in items]

@api_router.get("/ideas/{id}", response_model=IdeaSuggestion)
async def get_idea(id: str, current_user: dict = Depends(get_current_user)):
    item = await db.idea_suggestions.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.put("/ideas/{id}", response_model=IdeaSuggestion)
async def update_idea(id: str, data: IdeaSuggestionCreate, current_user: dict = Depends(get_current_user)):
    existing = await db.idea_suggestions.find_one({"id": id}, {"_id": 0})
    await db.idea_suggestions.update_one({"id": id}, {"$set": data.model_dump()})
    
    if existing and existing.get('status') != "Accepted" and data.status == "Accepted":
        task = Task(task_title=f"Task: {data.idea_title}", description=data.idea_description,
                   linked_idea_id=id, assigned_to_id=data.submitted_by_id, priority="Medium",
                   status="To Do", deadline=(datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%d"))
        tdoc = task.model_dump()
        tdoc['created_at'] = tdoc['created_at'].isoformat()
        await db.tasks.insert_one(tdoc)
    
    item = await db.idea_suggestions.find_one({"id": id}, {"_id": 0})
    return parse_datetimes(item)

@api_router.delete("/ideas/{id}")
async def delete_idea(id: str, current_user: dict = Depends(get_current_user)):
    result = await db.idea_suggestions.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# Tasks
@api_router.post("/tasks", response_model=Task)
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    obj = Task(**task.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.tasks.insert_one(doc)
    return obj

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(current_user: dict = Depends(get_current_user)):
    items = await db.tasks.find({}, {"_id": 0}).to_list(1000)
    return [parse_datetimes(item) for item in items]

@api_router.get("/tasks/{id}", response_model=Task)
async def get_task(id: str, current_user: dict = Depends(get_current_user)):
    item = await db.tasks.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.put("/tasks/{id}", response_model=Task)
async def update_task(id: str, data: TaskCreate, current_user: dict = Depends(get_current_user)):
    existing = await db.tasks.find_one({"id": id}, {"_id": 0})
    await db.tasks.update_one({"id": id}, {"$set": data.model_dump()})
    
    if existing and existing.get('status') != "Completed" and data.status == "Completed":
        logging.info(f"Task {id} completed")
    
    item = await db.tasks.find_one({"id": id}, {"_id": 0})
    return parse_datetimes(item)

@api_router.delete("/tasks/{id}")
async def delete_task(id: str, current_user: dict = Depends(get_current_user)):
    result = await db.tasks.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# Meeting Notes
@api_router.post("/meeting-notes", response_model=MeetingNote)
async def create_meeting_note(note: MeetingNoteCreate, current_user: dict = Depends(get_current_user)):
    obj = MeetingNote(**note.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.meeting_notes.insert_one(doc)
    return obj

@api_router.get("/meeting-notes", response_model=List[MeetingNote])
async def get_meeting_notes(current_user: dict = Depends(get_current_user)):
    items = await db.meeting_notes.find({}, {"_id": 0}).to_list(1000)
    return [parse_datetimes(item) for item in items]

@api_router.get("/meeting-notes/{id}", response_model=MeetingNote)
async def get_meeting_note(id: str, current_user: dict = Depends(get_current_user)):
    item = await db.meeting_notes.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.put("/meeting-notes/{id}", response_model=MeetingNote)
async def update_meeting_note(id: str, data: MeetingNoteCreate, current_user: dict = Depends(get_current_user)):
    await db.meeting_notes.update_one({"id": id}, {"$set": data.model_dump()})
    item = await db.meeting_notes.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.delete("/meeting-notes/{id}")
async def delete_meeting_note(id: str, current_user: dict = Depends(get_current_user)):
    result = await db.meeting_notes.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# Client Conversations
@api_router.post("/client-conversations", response_model=ClientConversation)
async def create_client_conversation(conv: ClientConversationCreate, current_user: dict = Depends(get_current_user)):
    obj = ClientConversation(**conv.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.client_conversations.insert_one(doc)
    return obj

@api_router.get("/client-conversations", response_model=List[ClientConversation])
async def get_client_conversations(current_user: dict = Depends(get_current_user)):
    items = await db.client_conversations.find({}, {"_id": 0}).to_list(1000)
    return [parse_datetimes(item) for item in items]

@api_router.get("/client-conversations/{id}", response_model=ClientConversation)
async def get_client_conversation(id: str, current_user: dict = Depends(get_current_user)):
    item = await db.client_conversations.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.put("/client-conversations/{id}", response_model=ClientConversation)
async def update_client_conversation(id: str, data: ClientConversationCreate, current_user: dict = Depends(get_current_user)):
    await db.client_conversations.update_one({"id": id}, {"$set": data.model_dump()})
    item = await db.client_conversations.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.delete("/client-conversations/{id}")
async def delete_client_conversation(id: str, current_user: dict = Depends(get_current_user)):
    result = await db.client_conversations.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# Content Ideas
@api_router.post("/content-ideas", response_model=ContentIdea)
async def create_content_idea(idea: ContentIdeaCreate, current_user: dict = Depends(get_current_user)):
    obj = ContentIdea(**idea.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.content_ideas.insert_one(doc)
    return obj

@api_router.get("/content-ideas", response_model=List[ContentIdea])
async def get_content_ideas(current_user: dict = Depends(get_current_user)):
    items = await db.content_ideas.find({}, {"_id": 0}).to_list(1000)
    return [parse_datetimes(item) for item in items]

@api_router.get("/content-ideas/{id}", response_model=ContentIdea)
async def get_content_idea(id: str, current_user: dict = Depends(get_current_user)):
    item = await db.content_ideas.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.put("/content-ideas/{id}", response_model=ContentIdea)
async def update_content_idea(id: str, data: ContentIdeaCreate, current_user: dict = Depends(get_current_user)):
    await db.content_ideas.update_one({"id": id}, {"$set": data.model_dump()})
    item = await db.content_ideas.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.delete("/content-ideas/{id}")
async def delete_content_idea(id: str, current_user: dict = Depends(get_current_user)):
    result = await db.content_ideas.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# Creative Requests
@api_router.post("/creative-requests", response_model=CreativeRequest)
async def create_creative_request(req: CreativeRequestCreate, current_user: dict = Depends(get_current_user)):
    obj = CreativeRequest(**req.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.creative_requests.insert_one(doc)
    return obj

@api_router.get("/creative-requests", response_model=List[CreativeRequest])
async def get_creative_requests(current_user: dict = Depends(get_current_user)):
    items = await db.creative_requests.find({}, {"_id": 0}).to_list(1000)
    return [parse_datetimes(item) for item in items]

@api_router.get("/creative-requests/{id}", response_model=CreativeRequest)
async def get_creative_request(id: str, current_user: dict = Depends(get_current_user)):
    item = await db.creative_requests.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.put("/creative-requests/{id}", response_model=CreativeRequest)
async def update_creative_request(id: str, data: CreativeRequestCreate, current_user: dict = Depends(get_current_user)):
    await db.creative_requests.update_one({"id": id}, {"$set": data.model_dump()})
    item = await db.creative_requests.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.delete("/creative-requests/{id}")
async def delete_creative_request(id: str, current_user: dict = Depends(get_current_user)):
    result = await db.creative_requests.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# Assets
@api_router.post("/assets", response_model=Asset)
async def create_asset(asset: AssetCreate, current_user: dict = Depends(get_current_user)):
    obj = Asset(**asset.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.assets.insert_one(doc)
    return obj

@api_router.get("/assets", response_model=List[Asset])
async def get_assets(current_user: dict = Depends(get_current_user)):
    items = await db.assets.find({}, {"_id": 0}).to_list(1000)
    return [parse_datetimes(item) for item in items]

@api_router.get("/assets/{id}", response_model=Asset)
async def get_asset(id: str, current_user: dict = Depends(get_current_user)):
    item = await db.assets.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.post("/assets/{id}/download")
async def download_asset(id: str, current_user: dict = Depends(get_current_user)):
    asset = await db.assets.find_one({"id": id}, {"_id": 0})
    if not asset:
        raise HTTPException(404, "Not found")
    new_count = asset.get('download_count', 0) + 1
    await db.assets.update_one({"id": id}, {"$set": {"download_count": new_count}})
    return {"message": "Download counted", "new_count": new_count}

@api_router.put("/assets/{id}", response_model=Asset)
async def update_asset(id: str, data: AssetCreate, current_user: dict = Depends(get_current_user)):
    await db.assets.update_one({"id": id}, {"$set": data.model_dump()})
    item = await db.assets.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.delete("/assets/{id}")
async def delete_asset(id: str, current_user: dict = Depends(get_current_user)):
    result = await db.assets.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# Campaigns
@api_router.post("/campaigns", response_model=PerformanceCampaign)
async def create_campaign(camp: PerformanceCampaignCreate, current_user: dict = Depends(get_current_user)):
    obj = PerformanceCampaign(**camp.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.performance_campaigns.insert_one(doc)
    return obj

@api_router.get("/campaigns", response_model=List[PerformanceCampaign])
async def get_campaigns(current_user: dict = Depends(get_current_user)):
    items = await db.performance_campaigns.find({}, {"_id": 0}).to_list(1000)
    return [parse_datetimes(item) for item in items]

@api_router.get("/campaigns/{id}", response_model=PerformanceCampaign)
async def get_campaign(id: str, current_user: dict = Depends(get_current_user)):
    item = await db.performance_campaigns.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.put("/campaigns/{id}", response_model=PerformanceCampaign)
async def update_campaign(id: str, data: PerformanceCampaignCreate, current_user: dict = Depends(get_current_user)):
    await db.performance_campaigns.update_one({"id": id}, {"$set": data.model_dump()})
    item = await db.performance_campaigns.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.delete("/campaigns/{id}")
async def delete_campaign(id: str, current_user: dict = Depends(get_current_user)):
    result = await db.performance_campaigns.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# Skill Directory
@api_router.post("/skill-directory", response_model=SkillDirectory)
async def create_skill_entry(entry: SkillDirectoryCreate, current_user: dict = Depends(get_current_user)):
    obj = SkillDirectory(**entry.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.skill_directory.insert_one(doc)
    return obj

@api_router.get("/skill-directory", response_model=List[SkillDirectory])
async def get_skill_directory(current_user: dict = Depends(get_current_user)):
    items = await db.skill_directory.find({}, {"_id": 0}).to_list(1000)
    return [parse_datetimes(item) for item in items]

@api_router.get("/skill-directory/{id}", response_model=SkillDirectory)
async def get_skill_entry(id: str, current_user: dict = Depends(get_current_user)):
    item = await db.skill_directory.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.put("/skill-directory/{id}", response_model=SkillDirectory)
async def update_skill_entry(id: str, data: SkillDirectoryCreate, current_user: dict = Depends(get_current_user)):
    await db.skill_directory.update_one({"id": id}, {"$set": data.model_dump()})
    item = await db.skill_directory.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.delete("/skill-directory/{id}")
async def delete_skill_entry(id: str, current_user: dict = Depends(get_current_user)):
    result = await db.skill_directory.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# Knowledge Hub
@api_router.post("/knowledge-hub", response_model=KnowledgeHub)
async def create_knowledge(knowledge: KnowledgeHubCreate, current_user: dict = Depends(get_current_user)):
    obj = KnowledgeHub(**knowledge.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['last_updated'] = doc['last_updated'].isoformat()
    await db.knowledge_hub.insert_one(doc)
    return obj

@api_router.get("/knowledge-hub", response_model=List[KnowledgeHub])
async def get_knowledge_hub(current_user: dict = Depends(get_current_user)):
    items = await db.knowledge_hub.find({}, {"_id": 0}).to_list(1000)
    return [parse_datetimes(item, ['created_at', 'last_updated']) for item in items]

@api_router.get("/knowledge-hub/{id}", response_model=KnowledgeHub)
async def get_knowledge(id: str, current_user: dict = Depends(get_current_user)):
    item = await db.knowledge_hub.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item, ['created_at', 'last_updated'])

@api_router.put("/knowledge-hub/{id}", response_model=KnowledgeHub)
async def update_knowledge(id: str, data: KnowledgeHubCreate, current_user: dict = Depends(get_current_user)):
    upd = data.model_dump()
    upd['last_updated'] = datetime.now(timezone.utc).isoformat()
    await db.knowledge_hub.update_one({"id": id}, {"$set": upd})
    item = await db.knowledge_hub.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item, ['created_at', 'last_updated'])

@api_router.delete("/knowledge-hub/{id}")
async def delete_knowledge(id: str, current_user: dict = Depends(get_current_user)):
    result = await db.knowledge_hub.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# Shoutouts
@api_router.post("/shoutouts", response_model=Shoutout)
async def create_shoutout(shoutout: ShoutoutCreate, current_user: dict = Depends(get_current_user)):
    obj = Shoutout(**shoutout.model_dump())
    doc = obj.model_dump()
    doc['date'] = doc['date'].isoformat()
    await db.shoutouts.insert_one(doc)
    return obj

@api_router.get("/shoutouts", response_model=List[Shoutout])
async def get_shoutouts(current_user: dict = Depends(get_current_user)):
    items = await db.shoutouts.find({}, {"_id": 0}).to_list(1000)
    return [parse_datetimes(item, ['date']) for item in items]

@api_router.get("/shoutouts/{id}", response_model=Shoutout)
async def get_shoutout(id: str, current_user: dict = Depends(get_current_user)):
    item = await db.shoutouts.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item, ['date'])

@api_router.put("/shoutouts/{id}", response_model=Shoutout)
async def update_shoutout(id: str, data: ShoutoutCreate, current_user: dict = Depends(get_current_user)):
    await db.shoutouts.update_one({"id": id}, {"$set": data.model_dump()})
    item = await db.shoutouts.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item, ['date'])

@api_router.delete("/shoutouts/{id}")
async def delete_shoutout(id: str, current_user: dict = Depends(get_current_user)):
    result = await db.shoutouts.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# KPIs
@api_router.post("/kpis", response_model=KPI)
async def create_kpi(kpi: KPICreate, current_user: dict = Depends(get_current_user)):
    obj = KPI(**kpi.model_dump())
    if kpi.current_value < kpi.target_value:
        obj.flagged = True
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['last_updated'] = doc['last_updated'].isoformat()
    await db.kpis.insert_one(doc)
    return obj

@api_router.get("/kpis", response_model=List[KPI])
async def get_kpis(current_user: dict = Depends(get_current_user)):
    items = await db.kpis.find({}, {"_id": 0}).to_list(1000)
    return [parse_datetimes(item, ['created_at', 'last_updated']) for item in items]

@api_router.get("/kpis/{id}", response_model=KPI)
async def get_kpi(id: str, current_user: dict = Depends(get_current_user)):
    item = await db.kpis.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item, ['created_at', 'last_updated'])

@api_router.put("/kpis/{id}", response_model=KPI)
async def update_kpi(id: str, data: KPICreate, current_user: dict = Depends(get_current_user)):
    upd = data.model_dump()
    upd['last_updated'] = datetime.now(timezone.utc).isoformat()
    upd['flagged'] = data.current_value < data.target_value
    await db.kpis.update_one({"id": id}, {"$set": upd})
    item = await db.kpis.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item, ['created_at', 'last_updated'])

@api_router.delete("/kpis/{id}")
async def delete_kpi(id: str, current_user: dict = Depends(get_current_user)):
    result = await db.kpis.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# KRIs
@api_router.post("/kris", response_model=KRI)
async def create_kri(kri: KRICreate, current_user: dict = Depends(get_current_user)):
    obj = KRI(**kri.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.kris.insert_one(doc)
    
    if kri.risk_level == "Critical":
        logging.warning(f"CRITICAL RISK: {kri.risk_area}")
    return obj

@api_router.get("/kris", response_model=List[KRI])
async def get_kris(current_user: dict = Depends(get_current_user)):
    items = await db.kris.find({}, {"_id": 0}).to_list(1000)
    return [parse_datetimes(item) for item in items]

@api_router.get("/kris/{id}", response_model=KRI)
async def get_kri(id: str, current_user: dict = Depends(get_current_user)):
    item = await db.kris.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.put("/kris/{id}", response_model=KRI)
async def update_kri(id: str, data: KRICreate, current_user: dict = Depends(get_current_user)):
    existing = await db.kris.find_one({"id": id}, {"_id": 0})
    await db.kris.update_one({"id": id}, {"$set": data.model_dump()})
    
    if existing and existing.get('risk_level') != "Critical" and data.risk_level == "Critical":
        logging.warning(f"CRITICAL RISK ESCALATION: {data.risk_area}")
    
    item = await db.kris.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.delete("/kris/{id}")
async def delete_kri(id: str, current_user: dict = Depends(get_current_user)):
    result = await db.kris.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# Team Scorecards
@api_router.post("/scorecards", response_model=TeamScorecard)
async def create_scorecard(scorecard: TeamScorecardCreate, current_user: dict = Depends(get_current_user)):
    obj = TeamScorecard(**scorecard.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.team_scorecards.insert_one(doc)
    return obj

@api_router.get("/scorecards", response_model=List[TeamScorecard])
async def get_scorecards(current_user: dict = Depends(get_current_user)):
    items = await db.team_scorecards.find({}, {"_id": 0}).to_list(1000)
    return [parse_datetimes(item) for item in items]

@api_router.get("/scorecards/{id}", response_model=TeamScorecard)
async def get_scorecard(id: str, current_user: dict = Depends(get_current_user)):
    item = await db.team_scorecards.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.put("/scorecards/{id}", response_model=TeamScorecard)
async def update_scorecard(id: str, data: TeamScorecardCreate, current_user: dict = Depends(get_current_user)):
    await db.team_scorecards.update_one({"id": id}, {"$set": data.model_dump()})
    item = await db.team_scorecards.find_one({"id": id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    return parse_datetimes(item)

@api_router.delete("/scorecards/{id}")
async def delete_scorecard(id: str, current_user: dict = Depends(get_current_user)):
    result = await db.team_scorecards.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"message": "Deleted"}

# Auto-generate scorecard
@api_router.post("/scorecards/auto-generate", response_model=TeamScorecard)
async def auto_generate_scorecard(team_name: str, reporting_period: str, current_user: dict = Depends(get_current_user)):
    kpis = await db.kpis.find({}, {"_id": 0}).to_list(1000)
    kris = await db.kris.find({}, {"_id": 0}).to_list(1000)
    tasks = await db.tasks.find({"status": "Completed"}, {"_id": 0}).to_list(1000)
    shoutouts = await db.shoutouts.find({}, {"_id": 0}).to_list(1000)
    
    kpi_summary = f"Total: {len(kpis)}, Flagged: {sum(1 for k in kpis if k.get('flagged', False))}"
    risk_summary = f"Total: {len(kris)}, Critical: {sum(1 for k in kris if k.get('risk_level') == 'Critical')}"
    wins = f"Tasks: {len(tasks)}, Shoutouts: {len(shoutouts)}"
    
    data = TeamScorecardCreate(
        team_name=team_name,
        reporting_period=reporting_period,
        goals_progress_summary="Auto-generated",
        kpi_performance_summary=kpi_summary,
        risks_issues=risk_summary,
        wins_recognitions=wins
    )
    
    obj = TeamScorecard(**data.model_dump())
    doc = obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.team_scorecards.insert_one(doc)
    return obj

# Root
@api_router.get("/")
async def root():
    return {"message": "All-In-One Work OS API", "version": "1.0", "modules": 15}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
