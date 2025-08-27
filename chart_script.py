import plotly.graph_objects as go
import plotly.express as px
import json

# Data from the provided JSON
data = {
  "units": [
    {"name": "Soldier", "attack": 10, "defense": 8, "health": 25, "goldCost": 20, "foodCost": 10, "woodCost": 0},
    {"name": "Spearman", "attack": 12, "defense": 15, "health": 30, "goldCost": 30, "foodCost": 15, "woodCost": 0},
    {"name": "Archer", "attack": 15, "defense": 5, "health": 20, "goldCost": 25, "foodCost": 12, "woodCost": 0},
    {"name": "Crossbowman", "attack": 20, "defense": 8, "health": 25, "goldCost": 40, "foodCost": 18, "woodCost": 0},
    {"name": "Knight", "attack": 25, "defense": 20, "health": 50, "goldCost": 80, "foodCost": 30, "woodCost": 0},
    {"name": "Catapult", "attack": 50, "defense": 5, "health": 40, "goldCost": 150, "foodCost": 0, "woodCost": 100}
  ]
}

# Extract unit data
units = data["units"]
unit_names = [unit["name"] for unit in units]
attack_values = [unit["attack"] for unit in units]
defense_values = [unit["defense"] for unit in units]
health_values = [unit["health"] for unit in units]

# Create grouped bar chart
fig = go.Figure()

# Add Attack bars
fig.add_trace(go.Bar(
    name='Attack',
    x=unit_names,
    y=attack_values,
    marker_color='#1FB8CD',
    cliponaxis=False
))

# Add Defense bars
fig.add_trace(go.Bar(
    name='Defense',
    x=unit_names,
    y=defense_values,
    marker_color='#FFC185',
    cliponaxis=False
))

# Add Health bars
fig.add_trace(go.Bar(
    name='Health',
    x=unit_names,
    y=health_values,
    marker_color='#ECEBD5',
    cliponaxis=False
))

# Update layout
fig.update_layout(
    title='Unit Combat Stats Comparison',
    xaxis_title='Unit Type',
    yaxis_title='Stat Value',
    barmode='group',
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5)
)

# Save the chart
fig.write_image("unit_stats_comparison.png")